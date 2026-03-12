import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { STRATEGY_JWT_REFRESH } from '../../../infrastrucutre/constants/auth';
import type { JwtPayload, JwtRefreshPayload } from '../../../infrastrucutre/interfaces/auth';
import { TokenType } from '../../../infrastrucutre/enums/auth';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, STRATEGY_JWT_REFRESH) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtRefreshPayload {
    if (payload.type !== TokenType.REFRESH) {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return { ...payload, refreshToken };
  }
}
