import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { createTicketDTO } from './dto/createTicket.dto';
import { TicketsService } from './tickets.service';
import { UsersService } from '../users/users.service';
import { getError } from '../common/helpers/error.helper';
import qr from 'qr-image';
import { ApiTags } from '@nestjs/swagger';
import { assignAssistantDTO } from './dto';
import { LocationsService } from '../locations/locations.service';
@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private locationsService: LocationsService,
  ) {}

  @Post()
  async createTicket(@Res() res: Response, @Body() data: createTicketDTO) {
    try {
      let user = await this.usersService.getUser({
        identityCard: data.clientIdentityCard,
      });

      if (!user) {
        user = await this.usersService.createUser({
          identityCard: data.clientIdentityCard,
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone,
          profile: 'GUEST',
        });
      }

      if (data.collectionType === 'WEB' && !!user && user.profile === 'GUEST') {
        user = await this.usersService.updateUserProfile(user._id, 'CLIENT');
      }

      let createdTickets = 0;
      // eslint-disable-next-line prefer-const
      let ticketsGenerados = [];
      for (let i = 0; i < data.assistants.length; i++) {
        const element = data.assistants[i];
        let assistant = await this.usersService.getUser({
          identityCard: element.identityCard,
        });

        if (!assistant) {
          assistant = await this.usersService.createUser({
            identityCard: element.identityCard,
            name: element.name,
            email: element.email,
            phone: element.phone,
            profile: 'GUEST',
          });
        }
        const ticketNumber = await this.ticketsService.countTickets();

        const location = await this.locationsService.getLocation({
          name: data.location,
        });

        const ticketData = {
          number: ticketNumber + 1,
          location: location._id,
          clientId: user._id,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails,
          invoiceDetails: data.invoiceDetails,
          collectionType: data.collectionType,
          assistantId: assistant._id,
          isVerified: data.isVerified,
          verifverifiedBy: null,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        ticketsGenerados.push(ticket);
        createdTickets++;
        await this.locationsService.updateAvailable(location._id);
        if (createdTickets === data.assistants.length) {
          return res.json({
            message: 'Tickets generados',
            tickets: ticketsGenerados,
          });
        }
      }
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Get(':id')
  async getTicket(@Res() res: Response, @Param('id') ticketId: string) {
    try {
      const ticket = await this.ticketsService.getTicket(ticketId);
      if (!ticket) throw new NotFoundException('Ticket no existente');
      return res.json(ticket);
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Get('location/:location')
  async getTicketsByLocation(
    @Res() res: Response,
    @Param('location') location: string,
  ) {
    try {
      const tickets = await this.ticketsService.getTicketsByLocation(location);
      return res.json(tickets);
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Post('new')
  async createTicketGeneral(@Res() res: Response, @Body() data: any) {
    try {
      // eslint-disable-next-line prefer-const
      let tickets = [];
      const { locationName, quantity } = data;
      let user = await this.usersService.getUser({
        identityCard: '0000000000',
      });

      if (!user) {
        user = await this.usersService.createUser({
          identityCard: '0000000000',
          name: 'Usuario Final',
          email: 'proyectos@imaksmart.com',
          phone: '9999999999',
          profile: 'GUEST',
        });
      }

      for (let i = 1; i <= quantity; i++) {
        const ticketNumber = await this.ticketsService.countTickets();

        const location = await this.locationsService.getLocation({
          name: locationName,
        });

        const ticketData = {
          number: ticketNumber + 1,
          location: location._id,
          clientId: user._id,
          paymentMethod: 'CASH',
          paymentDetails: null,
          invoiceDetails: null,
          collectionType: 'RESELLER',
          assistantId: user._id,
          isVerified: true,
          verifiedBy: null,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        tickets.push(ticket);
        console.log('Ticket generado: ', i);
        await this.locationsService.updateAvailable(location._id);
        if (i == quantity) {
          return res.json({
            message: 'Tickets generados',
            tickets: tickets,
          });
        }
      }
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Put('register/:id')
  async registerTicket(@Res() res: Response, @Param('id') ticketId: string) {
    try {
      const existTicket = await this.ticketsService.getTicket(ticketId);
      if (!existTicket) throw new NotFoundException('Ticket no existente');
      const ticket = await this.ticketsService.disableTicket(ticketId);
      if (!ticket) {
        return res.json({
          message: 'Ticket ya ha sido registrado registrado anteriormente',
          ticket: existTicket,
        });
      }
      return res.json({ message: 'Ticket registrado', ticket });
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Put('assistant/:id')
  async assignAssistant(
    @Res() res: Response,
    @Param('id') ticketId: string,
    @Body() data: assignAssistantDTO,
  ) {
    try {
      const existTicket = await this.ticketsService.getTicket(ticketId);
      if (!existTicket) throw new NotFoundException('Ticket no existente');
      if (!existTicket.isActive) {
        return res.json({
          message: 'El ticket ya ha sido usado',
        });
      }
      let existsAssistant = await this.usersService.getUser({
        identityCard: data.assistantIdentityCard,
      });

      if (!existsAssistant) {
        existsAssistant = await this.usersService.createUser({
          identityCard: data.assistantIdentityCard,
          name: data.assistantName,
          email: data.assistantEmail,
          phone: data.assistantPhone,
          profile: 'GUEST',
        });
      }

      const ticket = await this.ticketsService.updateAssistant(
        ticketId,
        existsAssistant._id,
      );

      return res.json({ message: 'Ticket registrado', ticket });
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }
}
