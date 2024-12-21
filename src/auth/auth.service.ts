import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Tokens } from 'src/types';
import { LoginDto } from 'src/dto/auth/login.dto';
import * as argon2 from 'argon2';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  public cookieOptions = {
    httpOnly: true,
    secure: this.tokenService.isProduction(),
    sameSite: this.tokenService.isProduction() ? 'none' : 'lax',
    path: '/',
  };

  async create(createUserDto: CreateUserDto) {
    Logger.log('registering user...', AuthService.name);
    const user = await this.userService.create(createUserDto);
    const token = await this.tokenService.generate(user.id);
    await this.userService.sendEmailVerificationEmail(user.email, token);
    return user.id;
  }

  // login
  async login(data: LoginDto) {
    Logger.log('Received request to login', AuthService.name);
    try {
      const user = await this.userService.find(AuthService, {
        email: data.email,
      });
      if (!user) {
        throw new BadRequestException('Invalid email');
      }
      const isPasswordValid = await argon2.verify(user.password, data.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      // generate tokens
      const { accessToken, refreshToken } = await this.tokenService.authTokens(
        user.id,
      );

      // persist refresh token with argon2 hash
      const hashedRefreshToken = await argon2.hash(refreshToken);
      await this.userService.update(user.id, {
        refreshToken: hashedRefreshToken,
      });
      Logger.log(
        `Login successful for user with email ${data.email}`,
        AuthService.name,
      );

      return { accessToken, refreshToken };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    Logger.log('Received request to verify email', AuthService.name);
    try {
      const data = await this.userService.verifyEmail(token);
      if (data) {
        return {
          message: 'Email verified successfully',
          data,
        };
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
      const { accessToken, refreshToken } =
        await this.tokenService.authTokens(userId);

      // persist refresh token with argon2 hash
      const hashedRefreshToken = await argon2.hash(refreshToken);
      const id = userId;
      await this.userService.update(id, { refreshToken: hashedRefreshToken });
      Logger.log(
        `Tokens refreshed successfully for user with id ${id}`,
        AuthService.name,
      );

      return { accessToken, refreshToken };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }

  async logout(accessToken: string) {
    Logger.log('Received request to logout', AuthService.name);
    try {
      const decoded = await this.tokenService.verify(accessToken);
      const user = await this.userService.find(AuthService, {
        id: decoded,
      });
      if (!user) {
        throw new BadRequestException('Invalid user');
      }
      await this.userService.update(user.id, { refreshToken: null });
      Logger.log(
        `Logout successful for user with email ${user.id}`,
        AuthService.name,
      );
      return {
        message: 'Logout successful',
      };
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthService.name);
      throw error;
    }
  }
}
