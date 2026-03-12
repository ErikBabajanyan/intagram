import { UserRole, TokenType } from '../../enums/auth';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  type: TokenType;
}

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}
