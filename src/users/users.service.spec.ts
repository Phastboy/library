import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
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
});
