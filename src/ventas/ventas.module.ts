import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventaSchema } from './schemas/venta.schema';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ventas', schema: ventaSchema }]),
    UsersModule,
    LocationsModule,
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
