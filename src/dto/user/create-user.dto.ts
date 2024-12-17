import { IsString, IsOptional, IsEmail, IsBoolean, IsPhoneNumber, IsStrongPassword, IsEnum } from 'class-validator';
import { Role } from 'src/types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  emailIsVerified?: boolean;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
