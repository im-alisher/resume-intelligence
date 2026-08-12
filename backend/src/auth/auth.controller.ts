import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './interfaces/auth-user.interface';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() input: RegisterDto) {
    return this.authService.register(input);
  }

  @Post('login')
  login(@Body() input: LoginDto) {
    return this.authService.login(input);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() input: ForgotPasswordDto) {
    return this.authService.forgotPassword(input.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(@Body() input: ResetPasswordDto) {
    return this.authService.resetPassword(input.token, input.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() authUser: AuthUser) {
    const user = await this.usersService.findPublicById(authUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
