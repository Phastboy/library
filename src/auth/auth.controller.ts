import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { LoginDto } from 'src/dto/auth/login.dto';
import { TokenService } from 'src/token/token.service';
import {  ApiCookieAuth, ApiQuery, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('authentication')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  private cookieOptions = {
    httpOnly: true,
    secure: this.tokenService.isProduction(),
    sameSite: this.tokenService.isProduction() ? 'none' : 'lax',
    path: '/',
  };

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
  @ApiOperation({ summary: 'Verify email address' })
  @ApiQuery({
    name: 'token',
    type: 'string',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Email successfully verified.' })
  @ApiResponse({ status: 400, description: 'Invalid token.' })
  async verifyEmail(@Query('token') token: string) {
    Logger.log(`Received request to verify email with token ${token}`, AuthController.name);
    try {
      if (!token) {
        throw new Error('Token is required');
      }
      return await this.authService.verifyEmail(token);
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto, @Res() res: any) {
    Logger.log('Received request to login', AuthController.name);
    try {
      const { accessToken, refreshToken} = await this.authService.login(loginDto);

      // set cookies
      await res.cookie('accessToken', accessToken, {
        ...this.cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });
      await res.cookie('refreshToken', refreshToken, {
        ...this.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      Logger.log(`cookies set`, AuthController.name);

      Logger.log(`Login successful for user with email ${loginDto.email}`, AuthController.name);
      return res.json({
        message: 'Login successful',
      });
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Get('refresh-tokens')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshTokens(@Req() req: any, @Res() res: any) {
    Logger.log('Received request to refresh tokens', AuthController.name);
    try {
      Logger.log(`Request headers: ${JSON.stringify(req.headers)}`, AuthController.name);
      const cookies = req.headers?.cookie;
      Logger.log(`cookies: ${JSON.stringify(cookies)}`, AuthController.name);

      // extract refresh token from cookies
      const refreshToken = cookies?.split(';').find((cookie: string) => cookie.trim().startsWith('refreshToken='))?.split('=')[1];
      Logger.log(`refreshToken: ${refreshToken}`, AuthController.name);
      if (!refreshToken) {
        Logger.error('Refresh token not found', AuthController.name);
        throw new Error('Refresh token not found');
      }

      // refresh tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);

      // set cookies
      await res.cookie('accessToken', accessToken, {
        ...this.cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });
      await res.cookie('refreshToken', refreshToken, {
        ...this.cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      Logger.log(`cookies set`, AuthController.name);

      return res.json({
        message: 'Tokens refreshed successfully',
      });     
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Req() req: any, @Res() res: any) {
    Logger.log('Received request to logout', AuthController.name);
    try {
      const cookies= req.headers?.cookie;
      Logger.log(`cookies: ${JSON.stringify(cookies)}`, AuthController.name);

      // extract refresh token from cookies
      const accessToken = cookies?.split(';').find((cookie: string) => cookie.trim().startsWith('accessToken='))?.split('=')[1];
      Logger.log(`refreshToken: ${accessToken}`, AuthController.name);
      if (!accessToken) {
        Logger.error('Refresh token not found', AuthController.name);
        throw new Error('Refresh token not found');
      }

      // update user with null refresh token
      await this.authService.logout(accessToken);

      // clear cookies
      await res.clearCookie('accessToken', this.cookieOptions);
      await res.clearCookie('refreshToken', this.cookieOptions);
      Logger.log(`cookies cleared`, AuthController.name);

      return res.json({
        message: 'Logout successful',
      });
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }
}
