import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username may only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  username: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  password: string;
}
