import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../../infrastrucutre/enums/auth';

export type UserDocument = HydratedDocument<User> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret['password'];
      return ret;
    },
  },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9_]+$/,
    minlength: 3,
    maxlength: 30,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
