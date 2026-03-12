import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';
import type { JwtPayload } from '../../../infrastrucutre/interfaces/auth';
import { STRATEGY_JWT_ACCESS } from '../../../infrastrucutre/constants/auth';
import { TokenType } from '../../../infrastrucutre/enums/auth';
import type { UserDocument } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGY_JWT_ACCESS) {
  constructor(
    configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    if (payload.type !== TokenType.ACCESS) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authRepository.findUserById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    return user;
  }
}
