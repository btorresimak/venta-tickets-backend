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

  async getReportOfSales(startDate: Date, endDate: Date) {
    const sales = await this.ticketModel
      .find({
        verifiedBy: { $ne: null },
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate(['location', 'clientId', 'assistantId']);

    const verifiedBy = sales.map((sale) => sale['verifiedBy']);

    const unique = verifiedBy.filter(this.onlyUnique);

    const salesByUser = unique.map((user) => {
      const salesUser = sales.filter((sale) => sale['verifiedBy'] == user);
      const salesGeneral = salesUser.filter(
        (sale) => sale['location']['name'] == 'GENERAL',
      );
      const salesVip = salesUser.filter(
        (sale) => sale['location']['name'] == 'VIP',
      );

      const salesGolden = salesUser.filter(
        (sale) => sale['location']['name'] == 'GOLDEN',
      );

      return {
        user,
        sales,
        salesGeneral: salesGeneral.length,
        salesVip: salesVip.length,
        salesGolden: salesGolden.length,
        amountGeneral: salesGeneral.length * 15,
        amountVip: salesVip.length * 20,
        amountGolden: salesGolden.length * 25,
      };
    });

    return salesByUser;
  }
  async getReportOfSalesByUser(startDate: Date, endDate: Date, user: string) {
    const sales = await this.ticketModel
      .find({
        verifiedBy: user,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate(['location', 'clientId', 'assistantId']);

    const verifiedBy = sales.map((sale) => sale['verifiedBy']);

    const unique = verifiedBy.filter(this.onlyUnique);

    const salesByUser = unique.map((user) => {
      const salesUser = sales.filter((sale) => sale['verifiedBy'] == user);
      const salesGeneral = salesUser.filter(
        (sale) => sale['location']['name'] == 'GENERAL',
      );
      const salesVip = salesUser.filter(
        (sale) => sale['location']['name'] == 'VIP',
      );

      const salesGolden = salesUser.filter(
        (sale) => sale['location']['name'] == 'GOLDEN',
      );

      return {
        user,
        salesGeneral: salesGeneral.length,
        salesVip: salesVip.length,
        salesGolden: salesGolden.length,
        amountGeneral: salesGeneral.length * 15,
        amountVip: salesVip.length * 20,
        amountGolden: salesGolden.length * 25,
        sales: salesUser,
      };
    });

    return salesByUser[0];
  }

  async getReportOfSalesFull() {
    const sales = await this.ticketModel
      .find({
        verifiedBy: { $ne: null },
      })
      .populate(['location', 'clientId', 'assistantId']);

    const verifiedBy = sales.map((sale) => sale['verifiedBy']);

    const unique = verifiedBy.filter(this.onlyUnique);

    let salesByUser = unique.map((user) => {
      const salesUser = sales.filter((sale) => sale['verifiedBy'] == user);
      const salesGeneral = salesUser.filter(
        (sale) => sale['location']['name'] == 'GENERAL',
      );
      const salesVip = salesUser.filter(
        (sale) => sale['location']['name'] == 'VIP',
      );

      const salesGolden = salesUser.filter(
        (sale) => sale['location']['name'] == 'GOLDEN',
      );

      return {
        user,
        salesGeneral: salesGeneral.length,
        salesVip: salesVip.length,
        salesGolden: salesGolden.length,
        amountGeneral: salesGeneral.length * 15,
        amountVip: salesVip.length * 20,
        amountGolden: salesGolden.length * 25,
      };
    });

    salesByUser = salesByUser.map((sale) => {
      const salesUser = sales.filter((s) => s['verifiedBy'] == sale.user);
      return { ...sale, sales: salesUser };
    });
    return salesByUser;
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  getTicketsByLocation(location: string) {
    return this.ticketModel
      .find({
        location,
        isActive: true,
        collectionType: 'RESELLER',
      })
      .populate(['assistantId', 'location', 'clientId']);
  }

  async getTicketsByNumber(ticketNumber: number, code: string) {
    const tickets = await this.ticketModel
      .find({ number: ticketNumber })
      .populate(['assistantId', 'location']);
    return tickets.find((ticket) => ticket._id.toString().includes(code));
  }

  async getTicketByNumber(number: number) {
    return this.ticketModel.findOne({ number });
  }

  countTickets() {
    return this.ticketModel.count();
  }

  createTicket(ticket: any) {
    return this.ticketModel.create(ticket);
  }

  getTicket(ticketId: string) {
    return this.ticketModel
      .findOne({ _id: ticketId })
      .populate(['clientId', 'assistantId', 'location']);
  }

  disableTicket(ticketId: string) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticketId, isActive: true },
      { isActive: false },
      { new: true },
    );
  }

  updateAssistant(ticketId: string, assistantId: string) {
    return this.ticketModel.findOneAndUpdate(
      { _id: ticketId, isActive: true },
      { assistantId },
      { new: true },
    );
  }

  async updateAssistantByNumber(numberTicket: string, assistantId: string) {
    const ticket = await this.ticketModel
      .findOne({ number: numberTicket, isActive: true })
      .populate(['assistantId']);
    if (ticket && ticket.assistantId['identityCard'] === '0000000000') {
    }

    return null;

    return this.ticketModel.findOneAndUpdate(
      { number: numberTicket, isActive: true },
      { assistantId },
      { new: true },
    );
  }

  existsTickets(clientTransactionId: string) {
    return this.ticketModel
      .find({
        'paymentDetails.clientTransactionId': clientTransactionId,
      })
      .populate(['assistantId', 'location']);
  }

  async getSalesReport(user: string, startDate: Date, endDate: Date) {
    const tickets = await this.ticketModel
      .find({
        verifiedBy: user,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate(['location', 'clientId', 'assistantId']);
    console.log(
      '🚀 ~ file: tickets.service.ts ~ line 78 ~ TicketsService ~ getSalesReport ~ tickets',
      tickets,
    );

    // const locations = ['GENERRAL', 'VIP', 'GOLDEN'];

    const generalTickets = tickets.filter(
      (ticket) => ticket.location['name'] == 'GENERAL',
    );

    console.log(generalTickets);

    const vipTickets = tickets.filter(
      (ticket) => ticket.location['name'] == 'VIP',
    );

    const goldenTickets = tickets.filter(
      (ticket) => ticket.location['name'] == 'GOLDEN',
    );

    const salesGeneral = generalTickets.length * 15;
    const salesGolden = goldenTickets.length * 20;
    const salesVip = vipTickets.length * 25;

    const clients = tickets.map((ticket) => ({
      name: ticket.clientId['name'],
      identityCard: ticket.clientId['identityCard'],
    }));
    const assistants = tickets.map((ticket) => ({
      name: ticket.assistantId['name'],
      identityCard: ticket.assistantId['identityCard'],
    }));

    return {
      clients,
      assistants,
      generalCount: generalTickets.length,
      vipCount: vipTickets.length,
      goldenCount: goldenTickets.length,
      salesGeneral,
      salesVip,
      salesGolden,
      totalCount: tickets.length,
      totalSales: salesGeneral + salesVip + salesGolden,
    };
  }
}
