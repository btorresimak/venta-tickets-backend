import {
  Body,
  Controller,
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
        collectionType: data.collectionType,
        assistantId: assistant._id,
      };

      const ticket = await this.ticketsService.createTicket(ticketData);
      const q = qr.image(ticket._id, { type: 'png' });
      //   const qrImage = qr.imageSync(ticket._id, { type: 'png' });
      return res.send(q);
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Put('register/:id')
  async registerTicket(@Res() res: Response, @Param('id') ticketId: string) {
    try {
      const ticket = await this.ticketsService.disableTicket(ticketId);
      if (!ticket)
        throw new NotFoundException('Ticket no encontrado o ya registrado');
      return res.json({ message: 'Ticket registrado', ticket });
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }
}
