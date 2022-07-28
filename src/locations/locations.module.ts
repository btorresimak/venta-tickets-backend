import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { locationSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'locations', schema: locationSchema }]),
    LocationsModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
