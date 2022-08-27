import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { LocationsService } from '../locations/locations.service';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Controller('ventas')
export class VentasController {
  logger = new Logger('VentasController');
  constructor(
    private readonly ventasService: VentasService,
    private readonly locationsService: LocationsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Res() res: Response, @Body() data: any) {
    try {
      const existsTicket = await this.ventasService.existsTickets(
        data.paymentDetails.clientTransactionId,
      );
      if (existsTicket.length > 0) {
        return res.json({
          message: 'Tickets generados anteriormente',
          tickets: existsTicket,
        });
      }

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
        const ticketNumber = await this.ventasService.contarVentas();

        const location = await this.locationsService.getLocation({
          name: data.location,
        });

        const ticketData = {
          number: ticketNumber,
          location: location._id,
          clientId: user._id,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails,
          invoiceDetails: null,
          collectionType: data.collectionType,
          assistantId: assistant._id,
          isVerified: data.isVerified,
          verifiedBy: data.verifiedBy || null,
        };

        const ticket = await this.ventasService.crearVenta(ticketData);
        // await this.sendEmail(assistant.email, ticket._id);

        ticketsGenerados.push(
          await ticket.populate(['assistantId', 'location']),
        );
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
      this.logger.error(error);
      return res.status(500).json({
        message: 'Error al generar los tickets',
        error: error.message,
      });
    }
  }

  @Get()
  async getTickets(@Res() res: Response) {
    try {
      const tickets = await this.ventasService.getTickets();
      return res.json(tickets);
    } catch (error) {
      this.logger.error(error);
      return res.status(500).json({
        message: 'Error al obtener los tickets',
        error: error.message,
      });
    }
  }
}
