import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_JWT_ACCESS } from '../constants/auth';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGY_JWT_ACCESS) {
  handleRequest<TUser>(err: Error | null, user: TUser | null | false): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Access token is invalid or expired');
    }
    return user as TUser;
  }
}
