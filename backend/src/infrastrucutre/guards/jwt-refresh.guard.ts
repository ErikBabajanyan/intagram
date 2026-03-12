import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_JWT_REFRESH } from '../constants/auth';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(STRATEGY_JWT_REFRESH) {
  handleRequest<TUser>(err: Error | null, user: TUser | null | false): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Refresh token is invalid or expired');
    }
    return user as TUser;
  }
}
