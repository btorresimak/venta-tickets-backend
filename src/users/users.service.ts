import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private readonly userModel: Model<User>) {}

  async getUsers() {
    return await this.userModel.find({ isActive: true }).populate('profile');
  }

  async createUser(user: any) {
    return await this.userModel.create(user);
  }

  async getUser(user: {
    _id?: string;
    identityCard?: string;
    email?: string;
    uid?: string;
  }) {
    user['isActive'] = true;
    return await this.userModel.findOne(user).populate('profile');
  }

  async updateUser(id: string, user: any) {
    return await this.userModel
      .findOneAndUpdate({ _id: id, isActive: true }, user, {
        new: true,
      })
      .populate('profile');
  }

  async updateUserProfile(id: string, profile: any) {
    return await this.userModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { profile },
      { new: true },
    );
  }

  async disableUser(id: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
  }
}
