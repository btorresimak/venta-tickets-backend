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
import { ApiTags } from '@nestjs/swagger';
import { assignAssistantDTO } from './dto';
import { LocationsService } from '../locations/locations.service';
import { entradas } from './interfaces/data.interface';
import axios from 'axios';
@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  apiKey = 'J4qhi7M843ieQQwqSWp3';

  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private locationsService: LocationsService,
  ) {}

  @Post()
  async createTicket(@Res() res: Response, @Body() data: createTicketDTO) {
    try {
      let claveAcceso = null;
      const existsTicket = await this.ticketsService.existsTickets(
        data.paymentDetails.clientTransactionId,
      );
      if (existsTicket.length > 0) {
        return res.json({
          message: 'Tickets generados',
          tickets: existsTicket,
        });
      }

      if (data.paymentMethod == 'PAYPHONE') {
        claveAcceso = await this.generateInvoice(
          data.paymentDetails,
          data.location,
          data.assistants.length,
        );
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
        const ticketNumber = await this.ticketsService.countTickets();

        const location = await this.locationsService.getLocation({
          name: data.location,
        });

        const ticketData = {
          number: ticketNumber + 4000,
          location: location._id,
          clientId: user._id,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails,
          invoiceDetails: claveAcceso,
          collectionType: data.collectionType,
          assistantId: assistant._id,
          isVerified: data.isVerified,
          verifverifiedBy: data.verifiedBy || null,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        await this.sendEmail(assistant.email, ticket._id);
        console.log(
          '🚀 ~ file: tickets.controller.ts ~ line 101 ~ TicketsController ~ createTicket ~ ticket',
          ticket,
        );

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
      const locationData = await this.locationsService.getLocation({
        name: location,
      });
      const tickets = await this.ticketsService.getTicketsByLocation(
        locationData._id,
      );
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
      const { locationName, quantity, name, email, phone, identityCard } = data;

      let user = await this.usersService.getUser({
        identityCard,
      });

      if (!user) {
        user = await this.usersService.createUser({
          identityCard,
          name,
          email,
          phone,
          profile: 'GUEST',
        });
      }
      console.log(
        '🚀 ~ file: tickets.controller.ts ~ line 178 ~ TicketsController ~ createTicketGeneral ~ user',
        user,
      );

      let assistant = await this.usersService.getUser({
        identityCard: '0000000000',
      });

      if (!assistant) {
        assistant = await this.usersService.createUser({
          identityCard: '0000000000',
          name: 'Usuario Final',
          email: 'proyectos@imaksmart.com',
          phone: '9999999999',
          profile: 'GUEST',
        });
      }

      const location = await this.locationsService.getLocation({
        name: locationName,
      });
      for (let i = 1; i <= quantity; i++) {
        const ticketNumber = await this.ticketsService.countTickets();

        const ticketData = {
          number: ticketNumber + 1,
          location: location._id,
          clientId: user._id,
          paymentMethod: 'CASH',
          paymentDetails: null,
          invoiceDetails: null,
          collectionType: 'RESELLER',
          assistantId: assistant._id,
          isVerified: true,
          verifiedBy: null,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        tickets.push(await ticket.populate(['assistantId', 'location']));
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

  @Post('cortesias')
  async createTicketsCortesias(@Res() res: Response, @Body() data: any) {
    try {
      // eslint-disable-next-line prefer-const
      let tickets = [];
      const { locationName, quantity, name, email, phone, identityCard } = data;

      let user = await this.usersService.getUser({
        identityCard,
      });

      if (!user) {
        user = await this.usersService.createUser({
          identityCard,
          name,
          email,
          phone,
          profile: 'GUEST',
        });
      }
      console.log(
        '🚀 ~ file: tickets.controller.ts ~ line 178 ~ TicketsController ~ createTicketGeneral ~ user',
        user,
      );

      let assistant = await this.usersService.getUser({
        identityCard: '0000000000',
      });

      if (!assistant) {
        assistant = await this.usersService.createUser({
          identityCard: '0000000000',
          name: 'Usuario Final',
          email: 'proyectos@imaksmart.com',
          phone: '9999999999',
          profile: 'GUEST',
        });
      }

      const location = await this.locationsService.getLocation({
        name: locationName,
      });
      for (let i = 1; i <= quantity; i++) {
        const ticketNumber = await this.ticketsService.countTickets();

        const ticketData = {
          number: ticketNumber + 1,
          location: location._id,
          clientId: user._id,
          paymentMethod: 'CASH',
          paymentDetails: null,
          invoiceDetails: null,
          collectionType: 'RESELLER',
          assistantId: assistant._id,
          isVerified: true,
          verifiedBy: null,
        };

        const ticket = await this.ticketsService.createTicket(ticketData);
        tickets.push(await ticket.populate(['assistantId', 'location']));
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

  async generateInvoice(
    paymentData: any,
    locationType: string,
    quantity: number,
  ): Promise<string> {
    try {
      const fechaEmision = this.formatDate(new Date());
      const total = paymentData.amount / 100;
      const tipoIdentificacion =
        paymentData.document.length === 10 ? '05' : '04';
      const formaPago = paymentData.cardType === 'Debit' ? '16' : '19';
      const tipoEntrada = entradas.find(
        (entrada) => entrada.nombre === locationType,
      );

      const valor = (tipoEntrada.baseImponible * quantity * 12) / 100;
      const secuencial = await this.obtenerSecuencialFactura(
        '1804485744001',
        '01',
      );

      const data = {
        campoAdicional: [
          {
            nombre: 'emailCliente',
            value: paymentData.email,
          },
        ],
        codDoc: '01',
        detalles: [
          {
            cantidad: quantity,
            codigoPrincipal: tipoEntrada.codigoPrincipal,
            descripcion: locationType,
            descuento: 0,
            detAdicional: [],
            impuesto: [
              {
                baseImponible: tipoEntrada.baseImponible * quantity,
                codigo: '2',
                codigoPorcentaje: '2',
                tarifa: 12,
                valor,
              },
            ],
            precioUnitario: tipoEntrada.baseImponible,
          },
        ],
        estab: '001',
        fechaEmision: fechaEmision.toString(),
        moneda: 'DOLAR',
        pagos: [
          {
            formaPago: formaPago,
            plazo: '0',
            total: total,
            unidadTiempo: 'Días',
          },
        ],
        ptoEmi: '002',
        receptor: {
          direccion: 'Ambato', //Dato quemado
          identificacion: paymentData.document,
          periodoFiscal: '',
          propina: 0,
          razonSocial: paymentData.optionalParameter4,
          tipoIdentificacion: tipoIdentificacion,
        },
        ruc: '1804485744001',
        secuencial,
        version: '1.0.0',
      };

      const claveAcceso = await this.facturar(data);
      await this.enviarAutorizarComprobante(claveAcceso);
      await this.enviarEmailFacturaElectronica(claveAcceso);
      return claveAcceso;
    } catch (error) {
      console.log(error);
    }
  }

  async obtenerSecuencialFactura(ruc: string, codDoc: string) {
    const { data: resp } = await axios.get(
      `https://api.veronica.ec/api/v1.0/empresas/${ruc}/secuenciales?codDoc=${codDoc}`,
      {
        headers: {
          'X-API-KEY': `${this.apiKey}`,
        },
      },
    );

    return resp.result[0].establecimiento.puntosEmision[0].secuencialFactura;
  }

  async facturar(datosFactura: any) {
    const { data } = await axios.post(
      'https://api.veronica.ec/api/v2.0/comprobantes/facturas',
      datosFactura,
      {
        headers: {
          'X-API-KEY': `${this.apiKey}`,
        },
      },
    );

    return data.result.claveAcceso;
  }

  async enviarAutorizarComprobante(claveAcceso: any) {
    console.log(claveAcceso);
    const { data } = await axios.patch(
      `https://api.veronica.ec/api/v1.0/comprobantes/${claveAcceso}/emitir`,
      {},
      {
        headers: {
          'X-API-KEY': `${this.apiKey}`,
        },
      },
    );
  }

  async enviarEmailFacturaElectronica(claveAcceso: any) {
    const {} = await axios.post(
      `https://api.veronica.ec/api/v1.0/comprobantes/${claveAcceso}/notificar?logo=true`,
      {},
      {
        headers: {
          'X-API-KEY': `${this.apiKey}`,
        },
      },
    );
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date) {
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
  }

  async sendEmail(email: string, ticketId: string) {
    const { data } = await axios.put(
      `http://143.198.176.190:3100/api/tickets/ticket-qr/${ticketId}`,
      {
        email,
      },
    );

    return data;
  }
}
