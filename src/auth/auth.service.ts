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
      const accessToken = await this.tokenService.generate(user as User, AuthService, '24h');
      const refreshToken = await this.tokenService.generate(user as User, AuthService, '7d');

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

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    Logger.log('Received request to refresh tokens', AuthService.name);
    try {
      // decode the refresh token and get the user
      const decoded = await this.tokenService.verify(refreshToken, AuthService);
      Logger.log(decoded, AuthService.name);
      const {password, ...user} = await this.userService.find(AuthService, { email: decoded.email });
      if(!user.refreshToken) {
        throw new BadRequestException('Invalid user');
      }

      // compare refresh token
      const isRefreshTokenValid = await argon2.verify(user.refreshToken, refreshToken);

      if (!isRefreshTokenValid) {
        throw new BadRequestException('Invalid refresh token');
      }

      // generate new tokens
      const accessToken = await this.tokenService.generate(user as User, AuthService, '24h');
      const newRefreshToken = await this.tokenService.generate(user as User, AuthService, '7d');

      // persist refresh token with argon2 hash
      const hashedRefreshToken = await argon2.hash(newRefreshToken);
      await this.userService.update(user.id, {refreshToken: hashedRefreshToken});
      Logger.log(`Tokens refreshed successfully for user with email ${user.email}`, AuthService.name);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async logout(accessToken: string) {
    Logger.log('Received request to logout', AuthService.name);
    try {
      const decoded = await this.tokenService.verify(accessToken, AuthService);
      const user = await this.userService.find(AuthService, { email: decoded.email });
      if(!user) {
        throw new BadRequestException('Invalid user');
      }
      await this.userService.update(user.id, {refreshToken: null});
      Logger.log(`Logout successful for user with email ${user.email}`, AuthService.name);
      return {
        message: 'Logout successful',
      }
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }
}
