import { IsString, IsOptional, IsEmail, IsBoolean, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  emailIsVerified?: boolean;
}
