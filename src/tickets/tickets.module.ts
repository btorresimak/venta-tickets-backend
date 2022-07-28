import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ticketSchema } from './schemas';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'tickets', schema: ticketSchema }]),
    UsersModule,
    LocationsModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
