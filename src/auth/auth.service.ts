import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto} from '../dto/user/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { User, Role, Tokens } from 'src/types';
import { LoginDto } from 'src/dto/auth/login.dto';
import * as argon2 from 'argon2';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private tokenService: TokenService) {}

  async create(createUserDto: CreateUserDto) {
    Logger.log('registering user...', AuthService.name);
    const payload = await this.userService.create(createUserDto);
    const token = await this.userService.generateEmailVerificationToken(payload);
    await this.userService.sendEmailVerificationEmail(payload.email, token);
    return {
      message: 'User registered successfully',
      data: payload,
    }
  }

  // login
  async login(data: LoginDto) {
    Logger.log('Received request to login', AuthService.name);
    try {
      const {password, ...user} = await this.userService.find(AuthService, { email: data.email });
      if (!user) {
        throw new BadRequestException('Invalid email');
      }
      const isPasswordValid = await argon2.verify(password, data.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      // generate tokens
      const { accessToken, refreshToken } = await this.tokenService.authTokens(user.id, AuthService);

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

  async refreshTokens(userId: string): Promise<Tokens> {
    Logger.log('Received request to refresh tokens', AuthService.name);
    try {
      // generate new tokens
      const { accessToken, refreshToken}= await this.tokenService.authTokens(userId, AuthService);

      // persist refresh token with argon2 hash
      const hashedRefreshToken = await argon2.hash(refreshToken);
      const id = userId;
      await this.userService.update(id, {refreshToken: hashedRefreshToken});
      Logger.log(`Tokens refreshed successfully for user with id ${id}`, AuthService.name);

      return { accessToken, refreshToken };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async logout(accessToken: string) {
    Logger.log('Received request to logout', AuthService.name);
    try {
      const decoded = await this.tokenService.verify(accessToken, AuthService);
      const user = await this.userService.find(AuthService, { id: decoded.userId });
      if(!user) {
        throw new BadRequestException('Invalid user');
      }
      await this.userService.update(user.id, {refreshToken: null});
      Logger.log(`Logout successful for user with email ${user.id}`, AuthService.name);
      return {
        message: 'Logout successful',
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }
}
