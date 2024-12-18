import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Pas$word123',
  })
  @IsString()
  password: string;
}
