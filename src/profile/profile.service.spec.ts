import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('ProfileService', () => {
  let service: ProfileService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: UsersService,
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            stripSensitiveFields: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('read', () => {
    it('should return user profile successfully', async () => {
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

      jest.spyOn(usersService, 'find').mockResolvedValue(user);
      jest.spyOn(usersService, 'stripSensitiveFields').mockReturnValue({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.read(userId);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(usersService.find).toHaveBeenCalledWith(ProfileService, { id: userId });
    });

    it('should throw an error if user is not found', async () => {
      const userId = '1';

      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      await expect(service.read(userId)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
      };
      const updatedUser = {
        id: '1',
        email: 'updated@example.com',
        username: 'updateduser',
        role: Role.user,
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual({
        id: '1',
        email: 'updated@example.com',
        username: 'updateduser',
        role: 'user',
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should throw an InternalServerErrorException if update fails', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
      };

      jest.spyOn(usersService, 'update').mockImplementation(() => {
        throw new Error('Error updating user');
      });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException('Error updating user'),
      );
    });
  });

  describe('delete', () => {
    it('should delete user profile successfully', async () => {
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

      jest.spyOn(usersService, 'delete').mockResolvedValue(deletedUser);

      const result = await service.delete(userId);

      expect(result).toEqual({
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        phoneNumber: '1234567890',
        emailIsVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(usersService.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw an InternalServerErrorException if delete fails', async () => {
      const userId = '1';

      jest.spyOn(usersService, 'delete').mockImplementation(() => {
        throw new Error('Error deleting user');
      });

      await expect(service.delete(userId)).rejects.toThrow(
        new InternalServerErrorException('Error deleting user'),
      );
    });
  });
});
