import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth/password.dto';
import { Response } from 'express';
import { setAuthCookies } from '../utils/cookie.util';
import { response } from '../utils/response.util';

jest.mock('../utils/cookie.util');
jest.mock('../utils/response.util');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let tokenService: TokenService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            create: jest.fn(),
            verifyEmail: jest.fn(),
            login: jest.fn(),
            refreshTokens: jest.fn(),
            logout: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            cookieOptions: {},
          },
        },
        {
          provide: TokenService,
          useValue: {
            isProduction: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: UsersService,
          useValue: {
            validateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: 'user',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const createdUser = {
        details: {
          id: '1',
          email: createUserDto.email,
          username: createUserDto.username,
          role: createUserDto.role,
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      jest.spyOn(authService, 'create').mockResolvedValue(createdUser);

      await controller.create(createUserDto, mockResponse);

      expect(authService.create).toHaveBeenCalledWith(createUserDto);
      expect(setAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        'accessToken',
        'refreshToken',
        expect.any(Object),
      );
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 201,
        message: 'User successfully registered',
        data: { user: createdUser.details },
      });
    });

    it('should throw an error if user registration fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: 'user',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'create').mockRejectedValue(new Error('User registration failed'));

      await expect(controller.create(createUserDto, mockResponse)).rejects.toThrow('User registration failed');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'token';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const verifiedData = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailIsVerified: true,
      };

      jest.spyOn(authService, 'verifyEmail').mockResolvedValue(verifiedData);

      await controller.verifyEmail(token, mockResponse);

      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Email successfully verified',
        data: verifiedData,
      });
    });

    it('should throw an error if email verification fails', async () => {
      const token = 'token';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'verifyEmail').mockRejectedValue(new Error('Email verification failed'));

      await expect(controller.verifyEmail(token, mockResponse)).rejects.toThrow('Email verification failed');
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(tokens);

      await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(setAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        'accessToken',
        'refreshToken',
        expect.any(Object),
      );
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Login successful',
      });
    });

    it('should throw an error if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Login failed'));

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow('Login failed');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockRequest = {
        userId: '1',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(tokens);

      await controller.refreshTokens(mockRequest, mockResponse);

      expect(authService.refreshTokens).toHaveBeenCalledWith('1');
      expect(setAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        'accessToken',
        'refreshToken',
        expect.any(Object),
      );
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Tokens refreshed successfully',
      });
    });

    it('should throw an error if token refresh fails', async () => {
      const mockRequest = {
        userId: '1',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'refreshTokens').mockRejectedValue(new Error('Token refresh failed'));

      await expect(controller.refreshTokens(mockRequest, mockResponse)).rejects.toThrow('Token refresh failed');
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const mockRequest = {
        headers: {
          cookie: 'accessToken=validToken',
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'logout').mockResolvedValue({ message: 'Logout successful' });

      await controller.logout(mockRequest, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('validToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Logout successful',
      });
    });

    it('should throw an error if logout fails', async () => {
      const mockRequest = {
        headers: {
          cookie: 'accessToken=validToken',
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'logout').mockRejectedValue(new Error('Logout failed'));

      await expect(controller.logout(mockRequest, mockResponse)).rejects.toThrow('Logout failed');
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const mockRequest = {
        userId: '1',
      };
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'changePassword').mockResolvedValue(null);

      await controller.changePassword(mockRequest, changePasswordDto, mockResponse);

      expect(authService.changePassword).toHaveBeenCalledWith('1', changePasswordDto);
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Password changed successfully',
      });
    });

    it('should throw an error if password change fails', async () => {
      const mockRequest = {
        userId: '1',
      };
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'changePassword').mockRejectedValue(new Error('Password change failed'));

      await expect(controller.changePassword(mockRequest, changePasswordDto, mockResponse)).rejects.toThrow('Password change failed');
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(null);

      await controller.forgotPassword(forgotPasswordDto, mockResponse);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto.email);
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Password reset email sent',
      });
    });

    it('should throw an error if password reset request fails', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'forgotPassword').mockRejectedValue(new Error('Password reset request failed'));

      await expect(controller.forgotPassword(forgotPasswordDto, mockResponse)).rejects.toThrow('Password reset request failed');
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword',
      };
      const token = 'token';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(null);

      await controller.resetPassword(resetPasswordDto, token, mockResponse);

      expect(authService.resetPassword).toHaveBeenCalledWith(token, resetPasswordDto.newPassword);
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Password reset successfully',
      });
    });

    it('should throw an error if password reset fails', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword',
      };
      const token = 'token';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      jest.spyOn(authService, 'resetPassword').mockRejectedValue(new Error('Password reset failed'));

      await expect(controller.resetPassword(resetPasswordDto, token, mockResponse)).rejects.toThrow('Password reset failed');
    });
  });
});
