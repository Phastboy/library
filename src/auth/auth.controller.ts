import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { LoginDto } from 'src/dto/auth/login.dto';
import { TokenService } from 'src/token/token.service';
import {
  ApiCookieAuth,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RefreshGuard } from './refresh.guard';
import { Response } from 'express';
import { response } from 'src/utils/response.util';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from 'src/dto/auth/password.dto';
import { setAuthCookies } from 'src/utils/cookie.util';

@ApiTags('authentication')
@Controller('')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const data = await this.authService.create(createUserDto);
      const { accessToken, refreshToken } =
        await this.tokenService.authTokens(data);

      // set cookies
      setAuthCookies(res, accessToken, refreshToken, {
        ...this.authService.cookieOptions,
        sameSite: 'strict',
      });
      Logger.log(`cookies set`, AuthController.name);

      return response(res, 201, 'Registration successful');
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
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    Logger.log(
      `Received request to verify email with token ${token}`,
      AuthController.name,
    );
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }
      const data = await this.authService.verifyEmail(token);
      return response(res, 200, 'Email successfully verified', data);
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Pas$word123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    Logger.log('Received request to login', AuthController.name);
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginDto);

      // set cookies
      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        this.authService.cookieOptions,
      );
      Logger.log(`cookies set`, AuthController.name);

      Logger.log(
        `Login successful for user with email ${loginDto.email}`,
        AuthController.name,
      );
      return response(res, 200, 'Login successful');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @UseGuards(RefreshGuard)
  @Get('refresh-tokens')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshTokens(@Req() req: any, @Res() res: Response) {
    Logger.log('Received request to refresh tokens', AuthController.name);
    try {
      Logger.log(
        `Request headers: ${JSON.stringify(req.headers)}`,
        AuthController.name,
      );
      const token = req.userId;
      Logger.log(`token: ${token}`, AuthController.name);

      // refresh tokens
      const { accessToken, refreshToken } =
        await this.authService.refreshTokens(token);

      // set cookies
      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        this.authService.cookieOptions,
      );
      Logger.log(`cookies set`, AuthController.name);

      return response(res, 200, 'Tokens refreshed successfully');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Req() req: any, @Res() res: Response) {
    Logger.log('Received request to logout', AuthController.name);
    try {
      const cookies = req.headers?.cookie;
      Logger.log(`cookies: ${JSON.stringify(cookies)}`, AuthController.name);

      // extract refresh token from cookies
      const accessToken = cookies
        ?.split(';')
        .find((cookie: string) => cookie.trim().startsWith('accessToken='))
        ?.split('=')[1];
      Logger.log(`refreshToken: ${accessToken}`, AuthController.name);
      if (!accessToken) {
        Logger.error('Refresh token not found', AuthController.name);
        throw new Error('Refresh token not found');
      }

      // update user with null refresh token
      await this.authService.logout(accessToken);

      // clear cookies
      await res.clearCookie('accessToken', {
        ...this.authService.cookieOptions,
        sameSite: 'strict',
      });
      await res.clearCookie('refreshToken', {
        ...this.authService.cookieOptions,
        sameSite: 'strict',
      });
      Logger.log(`cookies cleared`, AuthController.name);

      return response(res, 200, 'Logout successful');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    Logger.log('Received request to change password', AuthController.name);
    try {
      await this.authService.changePassword(req.userId, changePasswordDto);
      return response(res, 200, 'Password changed successfully');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    Logger.log('Received request to reset password', AuthController.name);
    try {
      await this.authService.forgotPassword(forgotPasswordDto.email);
      return response(res, 200, 'Password reset email sent');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }

  @Patch('reset-password')
  @ApiQuery({
    name: 'token',
    type: 'string',
    required: true,
  })
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    Logger.log('Received request to reset password', AuthController.name);
    try {
      await this.authService.resetPassword(token, resetPasswordDto.newPassword);
      return response(res, 200, 'Password reset successfully');
    } catch (error: any) {
      Logger.error(error.message, error.stack, AuthController.name);
      throw error;
    }
  }
}
