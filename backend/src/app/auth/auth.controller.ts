import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensResponseDto } from './dto/response/auth-tokens.response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { JwtAuthGuard } from '../../infrastrucutre/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../infrastrucutre/guards/jwt-refresh.guard';
import { CurrentUser } from '../../infrastrucutre/decorators/current-user.decorator';
import type { JwtRefreshPayload } from '../../infrastrucutre/interfaces/auth';
import type { UserDocument } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthTokensResponseDto> {
    try {
      return await this.authService.register(dto);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthTokensResponseDto> {
    try {
      return await this.authService.login(dto, req);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: UserDocument): Promise<void> {
    try {
      await this.authService.logout(user._id.toString());
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Logout failed');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() payload: JwtRefreshPayload,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    try {
      return await this.authService.refresh(payload.sub, payload.refreshToken, req);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: UserDocument): Promise<UserResponseDto> {
    try {
      return await this.authService.getMe(user._id.toString());
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}
