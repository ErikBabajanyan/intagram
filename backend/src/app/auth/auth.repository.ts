import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { RegisterDto } from './dto/register.dto';
import { CreateRefreshTokenData } from '../../infrastrucutre/types/auth';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async createUser(data: RegisterDto & { password: string }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ username: username.toLowerCase() })
      .exec();
  }

  async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenDocument> {
    const token = new this.refreshTokenModel(data);
    return token.save();
  }

  async findActiveRefreshToken(tokenHash: string): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel
      .findOne({ tokenHash, isRevoked: false })
      .exec();
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ tokenHash }, { isRevoked: true })
      .exec();
  }

  async revokeAllUserRefreshTokens(userId: Types.ObjectId): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId, isRevoked: false }, { isRevoked: true })
      .exec();
  }
}
