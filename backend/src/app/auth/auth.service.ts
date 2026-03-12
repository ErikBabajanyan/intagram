import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import type { Request } from 'express';
import type ms from 'ms';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensResponseDto } from './dto/response/auth-tokens.response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import type { JwtPayload } from '../../infrastrucutre/interfaces/auth';
import { TokenType } from '../../infrastrucutre/enums/auth';
import { BCRYPT_ROUNDS, REFRESH_TOKEN_EXPIRATION_DAYS } from '../../infrastrucutre/constants/auth';
import type { UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponseDto> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.authRepository.findUserByEmail(dto.email),
      this.authRepository.findUserByUsername(dto.username),
    ]);

    if (existingEmail) throw new ConflictException('Email is already registered');
    if (existingUsername) throw new ConflictException('Username is already taken');

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.authRepository.createUser({ ...dto, password: hashedPassword });

    return this.generateTokenPair(user);
  }

  async login(dto: LoginDto, req: Request): Promise<AuthTokensResponseDto> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    return this.generateTokenPair(user, req);
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserRefreshTokens(new Types.ObjectId(userId));
  }

  async refresh(
    userId: string,
    rawRefreshToken: string,
    req: Request,
  ): Promise<AuthTokensResponseDto> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.authRepository.findActiveRefreshToken(tokenHash);

    if (!storedToken) throw new UnauthorizedException('Refresh token is invalid or revoked');

    if (storedToken.expiresAt < new Date()) {
      await this.authRepository.revokeRefreshToken(tokenHash);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    await this.authRepository.revokeRefreshToken(tokenHash);
    return this.generateTokenPair(user, req);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return UserResponseDto.fromDocument(user);
  }

  private async generateTokenPair(
    user: UserDocument,
    req?: Request,
  ): Promise<AuthTokensResponseDto> {
    const basePayload: Omit<JwtPayload, 'type'> = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessSecret = this.configService.getOrThrow<string>('jwt.accessSecret');
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');
    const accessExpiration = this.configService.getOrThrow<string>(
      'jwt.accessExpiration',
    ) as ms.StringValue;
    const refreshExpiration = this.configService.getOrThrow<string>(
      'jwt.refreshExpiration',
    ) as ms.StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, type: TokenType.ACCESS },
        { secret: accessSecret, expiresIn: accessExpiration },
      ),
      this.jwtService.signAsync(
        { ...basePayload, type: TokenType.REFRESH },
        { secret: refreshSecret, expiresIn: refreshExpiration },
      ),
    ]);

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await this.authRepository.createRefreshToken({
      userId: user._id as Types.ObjectId,
      tokenHash,
      expiresAt,
      userAgent: req?.headers['user-agent'],
      ipAddress: req?.ip,
    });

    return new AuthTokensResponseDto(accessToken, refreshToken);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
