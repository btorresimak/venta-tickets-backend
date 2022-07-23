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
@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
  ) {}

  @Post()
  async createTicket(@Res() res: Response, @Body() data: createTicketDTO) {
    try {
      let user = await this.usersService.getUser({
        identityCard: data.clientIdentityCard,
      });

      let assistant;

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

      if (!data.hasAssistant) {
        assistant = user;
      } else {
        assistant = await this.usersService.getUser({
          identityCard: data.assistantIdentityCard,
        });

        if (!assistant) {
          assistant = await this.usersService.createUser({
            identityCard: data.assistantIdentityCard,
            name: data.assistantName,
            email: data.assistantEmail,
            phone: data.assistantPhone,
            profile: 'GUEST',
          });
        }
      }
      const ticketNumber = await this.ticketsService.countTickets();

      const ticketData = {
        number: ticketNumber + 1,
        location: data.location,
        clientId: user._id,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
        collectionType: data.collectionType,
        assistantId: assistant._id,
        isVerified: data.isVerified,
      };

      const ticket = await this.ticketsService.createTicket(ticketData);
      return res.json({ message: 'Ticket creado', ticket });
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
  async createTicket2500(@Res() res: Response, @Body() data: createTicketDTO) {
    try {
      let i = 0;
      for (i = 0; i < 2500; i++) {
        let user = await this.usersService.getUser({
          identityCard: data.clientIdentityCard,
        });

        let assistant;

        if (!user) {
          user = await this.usersService.createUser({
            identityCard: data.clientIdentityCard,
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone,
            profile: 'GUEST',
          });
        }

        if (
          data.collectionType === 'WEB' &&
          !!user &&
          user.profile === 'GUEST'
        ) {
          user = await this.usersService.updateUserProfile(user._id, 'CLIENT');
        }

        if (!data.hasAssistant) {
          assistant = user;
        } else {
          assistant = await this.usersService.getUser({
            identityCard: data.assistantIdentityCard,
          });

          if (!assistant) {
            assistant = await this.usersService.createUser({
              identityCard: data.assistantIdentityCard,
              name: data.assistantName,
              email: data.assistantEmail,
              phone: data.assistantPhone,
              profile: 'GUEST',
            });
          }
        }
        const ticketNumber = await this.ticketsService.countTickets();

        const ticketData = {
          number: ticketNumber + 1,
          location: data.location,
          clientId: user._id,
          paymentMethod: data.paymentMethod,
          collectionType: data.collectionType,
          assistantId: assistant._id,
          isVerified: data.isVerified,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        if (ticket) console.log('ticket creado', i);
        // if (i === 2499) return res.json({ message: 'Tickets creados', i });
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
