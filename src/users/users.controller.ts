import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { getError } from '../common/helpers';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getUsers(@Res() res: Response) {
    try {
      const users = await this.usersService.getUsers();
      return res.json(users);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Get(':id')
  async getUser(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.usersService.getUser({ _id: id });
      if (!user) throw new NotFoundException('No se ha encontrado el usuario');
      return res.json(user);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }
  @Post()
  async createUser(@Body() data: any, @Res() res: Response) {
    try {
      const user = await this.usersService.createUser(data);
      if (!user)
        throw new BadRequestException('No se ha podido crear el usuario');
      return res.json(user);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.updateUser(id, data);
      if (!user)
        throw new NotFoundException('No se ha podido encontrar el usuario');
      return res.json(user);
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.disableUser(id);
      if (!user)
        throw new NotFoundException('No se ha podido encontrar el usuario');
      return res.json({ message: 'Se ha eliminado el usuario' });
    } catch (error) {
      const errorData = getError(error);
      return res.status(errorData.statusCode).json(errorData);
    }
  }
}
