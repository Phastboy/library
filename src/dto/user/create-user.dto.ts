import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsPhoneNumber,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Username of the user',
    example: 'user123',
  })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Pas$word123',
  })
  @IsStrongPassword()
  password: string;

  @ApiPropertyOptional({
    description: 'Role of the user',
    enum: Role,
    default: Role.user,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.user;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+12345678901',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the email is verified',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  emailIsVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Refresh token of the user',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
