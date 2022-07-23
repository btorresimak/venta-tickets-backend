import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { User as UserEntity } from '../users/interfaces';
import { LocalAuthGuard } from './guards';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserEntity) {
    const data = this.authService.login(user);
    return data;
  }
}
