import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './schemas/';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'users', schema: userSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
