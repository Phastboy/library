import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto} from './dto/update-auth.dto';
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

  async verifyEmail(token: string) {
    Logger.log('Received request to verify email', AuthService.name);
    try {
      const verified = await this.userService.verifyEmailVerificationToken(token);
      if (verified) {
        Logger.log('Email verified successfully', AuthService.name);
        return {
          message: verified,
          details: 'You can now login to your account',
        }
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async profile(id: string) {
    Logger.log('Received request to get profile', AuthService.name);
    try {
      const profile = await this.userService.find(id);
      return {
        message: 'Profile fetched successfully',
        data: profile,
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

  update(id: number, updateAuthDto: UpdateUserDto) {
    return updateAuthDto;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
