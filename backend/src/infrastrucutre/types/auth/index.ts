import type { Types } from 'mongoose';

export type CreateRefreshTokenData = {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};
