import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'CurrentPas$word123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'NewPas$word123',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'New password of the user',
    example: 'NewPas$word123',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
