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

  getTicket(ticketId: string) {
    return this.ticketModel.findOne({ _id: ticketId });
  }

  disableTicket(ticketId: string) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticketId, isActive: true },
      { isActive: false },
      { new: true },
    );
  }
}
