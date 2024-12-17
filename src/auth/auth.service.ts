import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto} from '../dto/user/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { RequestPayload, Role, Tokens } from 'src/types';
import { LoginDto } from 'src/dto/auth/login.dto';
import * as argon2 from 'argon2';
import { generate } from 'rxjs';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private tokenService: TokenService) {}

  async create(createUserDto: CreateUserDto) {
    Logger.log('registering user...', AuthService.name);
    const { email, username, role: prismaRole, id, ...others} = await this.userService.create(createUserDto);
    const role: Role = prismaRole as Role;
    const payload: RequestPayload = { email, username, role, id, emailIsVerified: false };
    const token = await this.userService.generateEmailVerificationToken(payload);
    const sendEmail = await this.userService.sendEmailVerificationEmail(email, token);
    return {
      message: 'User registered successfully',
      data: {
        email,
        username,
        role,
      }
    }
  }

  // login
  async login(data: LoginDto) {
    Logger.log('Received request to login', AuthService.name);
    try {
      const user = await this.userService.userExists(data.email, AuthService);
      const isPasswordValid = await argon2.verify(user.password, data.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      // generate tokens
      const payload: RequestPayload = { email: user.email, username: user.username, role: user.role as Role, id: user.id, emailIsVerified: user.emailIsVerified };
      const accessToken = await this.tokenService.generate(payload, AuthService, '24h');
      const refreshToken = await this.tokenService.generate(payload, AuthService, '7d');

      // persist refresh token with argon2 hash
      const hashedRefreshToken = await argon2.hash(refreshToken);
      await this.userService.update(user.id, {refreshToken: hashedRefreshToken});
      Logger.log(`Login successful for user with email ${data.email}`, AuthService.name);
      
      return { accessToken, refreshToken };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    Logger.log('Received request to verify email', AuthService.name);
    try {
      const data = await this.userService.verifyEmailVerificationToken(token);
      if (data) {
        return {
          message: 'Email verified successfully',
          data,
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
      const profile = await this.userService.findOne(id);
      return {
        message: 'Profile fetched successfully',
        data: profile,
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    Logger.log('Received request to update profile', AuthService.name);
    try {
      const profile = await this.userService.update(id, updateUserDto);
      return {
        message: 'Profile updated successfully',
        data: profile,
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }
}
