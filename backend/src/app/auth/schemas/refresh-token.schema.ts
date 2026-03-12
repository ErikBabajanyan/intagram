import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  tokenHash: string;

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  userAgent?: string;

  @Prop()
  ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
