import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    // Check if the email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      Logger.error('Email already in use');
      throw new BadRequestException('Email already in use');
    }

    // Hash the password and Create the user
    const hashedPassword = await argon2.hash(data.password);
    try {
      Logger.log('Creating user...', UsersService.name);
      const { password, ...result } = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.email.split('@')[0], // Default username based on email
          password: hashedPassword,
        },
      });
      Logger.log('User created successfully', UsersService.name);

      return result;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new BadRequestException('Error creating user');
    }
  }
}
