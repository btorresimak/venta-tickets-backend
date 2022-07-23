import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { userSchema } from '../users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/constants';
import { LocalStrategy } from './strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy],
  imports: [
    MongooseModule.forFeature([{ name: 'users', schema: userSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(JWT_SECRET),
        signOptions: { expiresIn: config.get<string>(JWT_EXPIRES_IN) },
      }),
    }),
  ],
})
export class AuthModule {}
