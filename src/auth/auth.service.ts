import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/interfaces';
import { IUser } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('users') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne<IUser>({
      email,
      isActive: true,
      profile: { $ne: 'GUEST' },
    });
    //   .populate('profile');
    if (user && (await user.comparePassword(password))) return user;
    return null;
  }

  login(user: any) {
    const payload = { sub: user._id };
    delete user._id;
    return { user, accessToken: this.jwtService.sign(payload) };
  }
}
