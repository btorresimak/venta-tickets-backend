import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfilesModule } from './profiles/profiles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // .env.development
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
      }),
    }),

    MongooseModule.forRoot(`${process.env.MONGO_URI}/${process.env.DB_NAME}`, {
      ssl: true,
      sslValidate: true,
      sslKey: `${__dirname}/../certs/${process.env.CERT_NAME}`,
      sslCert: `${__dirname}/../certs/${process.env.CERT_NAME}`,
      authMechanism: 'MONGODB-X509',
      retryWrites: true,
      w: 'majority',
      authSource: '$external',
    }),

    ProfilesModule,

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
