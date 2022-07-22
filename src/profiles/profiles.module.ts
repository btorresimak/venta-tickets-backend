import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'profiles', schema: ProfileSchema }]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
