import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { locationSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'locations', schema: locationSchema }]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
