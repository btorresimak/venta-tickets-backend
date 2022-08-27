import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venta } from './interfaces/venta.interface';

@Injectable()
export class VentasService {
  constructor(
    @InjectModel('ventas') private readonly ventaModel: Model<Venta>,
  ) {}

  existsTickets(clientTransactionId: string) {
    return this.ventaModel
      .find({
        'paymentDetails.clientTransactionId': clientTransactionId,
      })
      .populate(['assistantId', 'location']);
  }

  async crearVenta(venta: any) {
    return await this.ventaModel.create(venta);
  }

  async contarVentas() {
    return await this.ventaModel.countDocuments({});
  }

  getTickets() {
    return this.ventaModel.find({ isActive: true }).populate(['location', 'clientId', 'assistantId']);
  }
}
