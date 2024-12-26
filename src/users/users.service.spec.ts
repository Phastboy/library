import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let mailService: MailService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generate: jest.fn(),
            authTokens: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    tokenService = module.get<TokenService>(TokenService);
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

      const hashedPassword = 'hashedPassword';
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(service, 'find').mockResolvedValue(null);
      jest.spyOn(tokenService, 'generate').mockResolvedValue('token');
      jest.spyOn(tokenService, 'authTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
        refreshToken: 'refreshToken',
        phoneNumber: '+12345678901',
        emailIsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
        refreshToken: 'refreshToken',
        phoneNumber: '+12345678901',
        emailIsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (callback) => {
          return callback(prismaService);
        });

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        details: {
          id: '1',
          email: createUserDto.email,
          username: createUserDto.username,
          role: createUserDto.role,
          phoneNumber: '+12345678901',
          emailIsVerified: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          username: createUserDto.username,
          role: createUserDto.role,
        },
      });
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        createUserDto.email,
        'Email Verification',
        expect.any(String),
      );
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: Role.user,
      };

      jest.spyOn(service, 'find').mockResolvedValue({
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
    });

    it('should throw an error if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: Role.user,
      };

      jest.spyOn(service, 'find').mockResolvedValue({
        id: '2',
        email: 'another@example.com',
        username: createUserDto.username,
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Username already exists'),
      );
    });

    it('should throw an internal server error if transaction fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
        role: Role.user,
      };

      jest.spyOn(service, 'find').mockResolvedValue(null);
      jest.spyOn(prismaService, '$transaction').mockImplementation(async () => {
        throw new Error('Transaction failed');
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('find', () => {
    it('should find a user by criteria', async () => {
      const criteria = { email: 'test@example.com' };
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

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(user);

      const result = await service.find(UsersService, criteria);

      expect(result).toEqual(user);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }],
        },
      });
    });

    it('should return null if no user is found', async () => {
      const criteria = { email: 'test@example.com' };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      const result = await service.find(UsersService, criteria);

      expect(result).toBeNull();
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }],
        },
      });
    });

    it('should throw a BadRequestException if criteria is invalid', async () => {
      const criteria = {};

      await expect(service.find(UsersService, criteria)).rejects.toThrow(
        new BadRequestException('Invalid criteria'),
      );
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const users = [
        {
          id: '1',
          email: 'test1@example.com',
          username: 'testuser1',
          password: 'hashedPassword1',
          role: Role.user,
          phoneNumber: '1234567890',
          emailIsVerified: true,
          refreshToken: 'refreshToken1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedPassword2',
          role: Role.user,
          phoneNumber: '1234567890',
          emailIsVerified: true,
          refreshToken: 'refreshToken2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users.map((user) => service.stripSensitiveFields(user)));
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
      };
      const updatedUser = {
        id: '1',
        email: 'updated@example.com',
        username: 'updateduser',
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual({
        id: '1',
        email: 'updated@example.com',
        username: 'updateduser',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should throw an InternalServerErrorException if update fails', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
      };

      jest.spyOn(prismaService.user, 'update').mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException('Error updating user'),
      );
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const userId = '1';
      const deletedUser = {
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

      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(deletedUser);

      const result = await service.delete(userId);

      expect(result).toEqual(deletedUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an InternalServerErrorException if delete fails', async () => {
      const userId = '1';

      jest.spyOn(prismaService.user, 'delete').mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(service.delete(userId)).rejects.toThrow(
        new InternalServerErrorException('Error deleting user'),
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a refresh token successfully', async () => {
      const token = 'refreshToken';
      const userId = '1';
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'hashedRefreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tokenService, 'verify').mockResolvedValue(userId);
      jest.spyOn(service, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const result = await service.validateRefreshToken(token);

      expect(result).toEqual(userId);
      expect(tokenService.verify).toHaveBeenCalledWith(token);
      expect(service.find).toHaveBeenCalledWith(UsersService, { id: userId });
      expect(argon2.verify).toHaveBeenCalledWith(user.refreshToken, token);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      const token = 'refreshToken';
      const userId = '1';

      jest.spyOn(tokenService, 'verify').mockResolvedValue(userId);
      jest.spyOn(service, 'find').mockResolvedValue(null);

      await expect(service.validateRefreshToken(token)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });

    it('should throw an UnauthorizedException if refresh token is invalid', async () => {
      const token = 'refreshToken';
      const userId = '1';
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'hashedRefreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tokenService, 'verify').mockResolvedValue(userId);
      jest.spyOn(service, 'find').mockResolvedValue(user);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.validateRefreshToken(token)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });
  });
});
