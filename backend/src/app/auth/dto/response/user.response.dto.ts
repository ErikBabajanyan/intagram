import { UserRole } from '../../../../infrastrucutre/enums/auth';
import type { UserDocument } from '../../schemas/user.schema';

export class UserResponseDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromDocument(user: UserDocument): UserResponseDto {
    return new UserResponseDto(user);
  }
}
