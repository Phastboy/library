import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async create(createUserDto: CreateUserDto) {
    Logger.log('registering user...', AuthService.name);
    const { email, id, ...others} = await this.userService.create(createUserDto);
    const token = await this.userService.generateEmailVerificationToken(email, id);
    const sendEmail = await this.userService.sendEmailVerificationEmail(email, token);
    return {
      message: 'User registered successfully',
      data: {
        email,
        username: others.username,
      }
    }
  }

  async verifyEmail(email: string, token: string) {
    Logger.log('Received request to verify email', AuthService.name);
    try {
      return {
        message: 'your email will be verified here',
        details: 'email verification feature is actively under development',
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  findAll() {
    return {
      message: `This action returns all auth`,
      details: `under development`,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return updateAuthDto;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
