import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { getError } from '../common/helpers/error.helper';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly loctionsService: LocationsService) {}

  @Get()
  async getLocations(@Res() res: Response) {
    try {
      const locations = await this.loctionsService.getLocations();
      return res.json(locations);
    } catch (error) {
      console.log(error);
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Get(':id')
  async getLocation(@Res() res: Response, @Param('id') id: string) {
    try {
      const location = await this.loctionsService.getLocation({ _id: id });
      if (!location)
        throw new NotFoundException('No se ha encontrado la localidad');
      return res.json(location);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Post()
  async createLocation(@Body() data: any, @Res() res: Response) {
    try {
      const locations = [
        {
          name: 'General',
          total: 5600,
          available: 5600,
        },
        {
          name: 'Golden',
          total: 930,
          available: 930,
        },
        {
          name: 'V.I.P',
          total: 930,
          available: 930,
        },
        {
          name: 'Cortesía General',
          total: 400,
          available: 400,
        },
        {
          name: 'Cortesía V.I.P',
          total: 70,
          available: 70,
        },
        {
          name: 'Cortesía Golden',
          total: 70,
          available: 70,
        },
      ];

      locations.forEach(async (location) => {
        const newLocation = this.loctionsService.createLocation(location);
        if (!newLocation)
          throw new BadRequestException('No se ha podido crear la localidad');
      });
      //   return res.json(location);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }
}
