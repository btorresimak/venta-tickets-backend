import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './interfaces';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('tickets') private readonly ticketModel: Model<Ticket>,
  ) {}

  getTickets() {
    return this.ticketModel.find({ isActive: true });
  }

  countTickets() {
    return this.ticketModel.count();
  }

  createTicket(ticket: any) {
    return this.ticketModel.create(ticket);
  }
}
