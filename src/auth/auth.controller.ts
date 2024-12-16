import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { LoginDto } from 'src/dto/auth/login.dto';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const data = await this.authService.create(createUserDto);
      return data;
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    Logger.log(`Received request to verify email with token ${token}`, AuthController.name);
    try {
      if (!token) {
        throw new Error('Token are required');
      }
      return await this.authService.verifyEmail(token);
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    Logger.log('Received request to login', AuthController.name);
    try {
      const data = await this.authService.login(loginDto);
      Logger.log(`Login successful for user with email ${loginDto.email}`, AuthController.name);
      return data;
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Get('/profile')
  async profile(@Req() req) {
    Logger.log('Received request to get profile', AuthController.name);
    try {
      Logger.log(`Fetching profile for user with id ${req.user.id}`, AuthController.name);
      if (!req.user.id) {
        Logger.error('User id is required', AuthController.name);
        throw new Error('User id is required');
      }
      const profile = await this.authService.profile(req.user.id);
      return profile;
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Patch('update-profile')
  async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    Logger.log('Received request to update profile', AuthController.name);
    try {
      Logger.log(`Updating profile for user with id ${req.user.id}`, AuthController.name);
      if (!req.user.id) {
        Logger.error('User id is required', AuthController.name);
        throw new Error('User id is required');
      }
      const updated = await this.authService.updateProfile(req.user.id, updateUserDto);
      return updated;
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }
}
