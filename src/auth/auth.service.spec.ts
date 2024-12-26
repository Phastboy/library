import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokenService } from '../token/token.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { ChangePasswordDto } from '../dto/auth/password.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let tokenService: TokenService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            verifyEmail: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generate: jest.fn(),
            authTokens: jest.fn(),
            verify: jest.fn(),
            isProduction: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    tokenService = module.get<TokenService>(TokenService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: Role.user,
      };

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

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw an error if user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: Role.user,
      };

      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new Error('User creation failed'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        'User creation failed',
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        username: 'testuser',
        password: await argon2.hash(loginDto.password),
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(tokenService, 'authTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(usersService.find).toHaveBeenCalledWith(AuthService, {
        email: loginDto.email,
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        user.password,
        loginDto.password,
      );
      expect(tokenService.authTokens).toHaveBeenCalledWith(user.id);
    });

    it('should throw an error if email is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException('Invalid email'),
      );
    });

    it('should throw an error if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        username: 'testuser',
        password: await argon2.hash('wrongpassword'),
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new BadRequestException('Invalid password'),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'token';
      const verifiedData = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailIsVerified: true,
      };

      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(verifiedData);

      const result = await service.verifyEmail(token);

      expect(result).toEqual(verifiedData);
      expect(usersService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should throw an error if email verification fails', async () => {
      const token = 'token';

      jest
        .spyOn(usersService, 'verifyEmail')
        .mockRejectedValue(new Error('Email verification failed'));

      await expect(service.verifyEmail(token)).rejects.toThrow(
        'Email verification failed',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const userId = '1';
      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      jest.spyOn(tokenService, 'authTokens').mockResolvedValue(tokens);
      jest.spyOn(argon2, 'hash').mockResolvedValue('hashedRefreshToken');
      jest.spyOn(usersService, 'update').mockResolvedValue(null);

      const result = await service.refreshTokens(userId);

      expect(result).toEqual(tokens);
      expect(tokenService.authTokens).toHaveBeenCalledWith(userId);
      expect(argon2.hash).toHaveBeenCalledWith(tokens.refreshToken);
      expect(usersService.update).toHaveBeenCalledWith(userId, {
        refreshToken: 'hashedRefreshToken',
      });
    });

    it('should throw an error if token refresh fails', async () => {
      const userId = '1';

      jest
        .spyOn(tokenService, 'authTokens')
        .mockRejectedValue(new Error('Token refresh failed'));

      await expect(service.refreshTokens(userId)).rejects.toThrow(
        'Token refresh failed',
      );
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const accessToken = 'accessToken';
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.user,
        refreshToken: 'refreshToken',
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tokenService, 'verify').mockResolvedValue(user.id);
      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(usersService, 'update').mockResolvedValue(null);

      const result = await service.logout(accessToken);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(tokenService.verify).toHaveBeenCalledWith(accessToken);
      expect(usersService.find).toHaveBeenCalledWith(AuthService, {
        id: user.id,
      });
      expect(usersService.update).toHaveBeenCalledWith(user.id, {
        refreshToken: null,
      });
    });

    it('should throw an error if user is invalid', async () => {
      const accessToken = 'accessToken';

      jest.spyOn(tokenService, 'verify').mockResolvedValue('1');
      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      await expect(service.logout(accessToken)).rejects.toThrow(
        new BadRequestException('Invalid user'),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email successfully', async () => {
      const email = 'test@example.com';
      const user = {
        id: '1',
        email,
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(tokenService, 'generate').mockResolvedValue('token');
      jest.spyOn(mailService, 'sendEmail').mockResolvedValue(null);

      await service.forgotPassword(email);

      expect(usersService.find).toHaveBeenCalledWith(AuthService, { email });
      expect(tokenService.generate).toHaveBeenCalledWith(user.id);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        email,
        'Password Reset Request',
        expect.stringContaining('reset-password?token=token'),
      );
    });

    it('should throw an error if user is not found', async () => {
      const email = 'test@example.com';

      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const userId = '1';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: await argon2.hash(changePasswordDto.currentPassword),
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest
        .spyOn(argon2, 'verify')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      jest.spyOn(argon2, 'hash').mockResolvedValue('hashedNewPassword');
      jest.spyOn(usersService, 'update').mockResolvedValue(null);

      await service.changePassword(userId, changePasswordDto);

      expect(usersService.find).toHaveBeenCalledWith(AuthService, {
        id: userId,
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        user.password,
        changePasswordDto.currentPassword,
      );
      expect(argon2.verify).toHaveBeenCalledWith(
        user.password,
        changePasswordDto.newPassword,
      );
      expect(argon2.hash).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(usersService.update).toHaveBeenCalledWith(userId, {
        password: 'hashedNewPassword',
      });
    });

    it('should throw an error if current password is incorrect', async () => {
      const userId = '1';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: await argon2.hash('wrongPassword'),
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new BadRequestException('Current password is incorrect'),
      );
    });

    it('should throw an error if new password is the same as the current password', async () => {
      const userId = '1';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword',
        newPassword: 'currentPassword',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: await argon2.hash(changePasswordDto.currentPassword),
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new BadRequestException(
          'New password cannot be the same as the current password',
        ),
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const token = 'token';
      const newPassword = 'newPassword';
      const userId = '1';
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tokenService, 'verify').mockResolvedValue(userId);
      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'hash').mockResolvedValue('hashedNewPassword');
      jest.spyOn(usersService, 'update').mockResolvedValue(null);

      await service.resetPassword(token, newPassword);

      expect(tokenService.verify).toHaveBeenCalledWith(token);
      expect(usersService.find).toHaveBeenCalledWith(AuthService, {
        id: userId,
      });
      expect(argon2.hash).toHaveBeenCalledWith(newPassword);
      expect(usersService.update).toHaveBeenCalledWith(userId, {
        password: 'hashedNewPassword',
      });
    });

    it('should throw an error if user is not found', async () => {
      const token = 'token';
      const newPassword = 'newPassword';
      const userId = '1';

      jest.spyOn(tokenService, 'verify').mockResolvedValue(userId);
      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });
  });
});
