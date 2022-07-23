import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from './interfaces';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel('locations') private readonly locationModel: Model<Location>,
  ) {}

  getLocations() {
    return this.locationModel.find({ isActive: true });
  }

  getLocation(location: { _id?: string; name?: string }) {
    location['isActive'] = true;
    return this.locationModel.findOne(location);
  }

  createLocation(location: any) {
    return this.locationModel.create(location);
  }

  updateAvailable(id: string, available: number) {
    return this.locationModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { available: available - 1 },
      { new: true },
    );
  }
}
