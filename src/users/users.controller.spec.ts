import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleGuard } from '../auth/role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { response } from '../utils/response.util';
import { Role } from '@prisma/client';

jest.mock('../utils/response.util');

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', name: 'John Doe' }];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

      const mockResponse = { send: jest.fn() };
      await controller.findAll(mockResponse);

      expect(usersService.findAll).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'Users fetched successfully',
        data: { users: mockUsers },
      });
    });

    it('should handle errors', async () => {
      jest.spyOn(usersService, 'findAll').mockRejectedValue(new Error('Database error'));

      const mockResponse = { send: jest.fn() };

      await expect(controller.findAll(mockResponse)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        email: 'user@test.com',
        role: Role.user,
        password: 'hashedPassword',
        phoneNumber: '1234567890',
        emailIsVerified: true,
        refreshToken: 'refreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
      jest.spyOn(usersService, 'find').mockResolvedValue(user);

      const mockResponse = { send: jest.fn() };
      await controller.findOne('1', mockResponse);

      expect(usersService.find).toHaveBeenCalledWith(UsersController, { id: '1' });
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'User fetched successfully',
        data: { user },
      });
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(usersService, 'find').mockResolvedValue(null);

      const mockResponse = { send: jest.fn() };

      await expect(controller.findOne('1', mockResponse)).rejects.toThrow('User not found');
    });

    it('should handle errors', async () => {
      jest.spyOn(usersService, 'find').mockRejectedValue(new Error('Database error'));

      const mockResponse = { send: jest.fn() };

      await expect(controller.findOne('1', mockResponse)).rejects.toThrow('Database error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
        const user = {
            id: '1',
            username: 'testuser',
            email: 'user@test.com',
            role: Role.user,
            password: 'hashedPassword',
            phoneNumber: '1234567890',
            emailIsVerified: true,
            refreshToken: 'refreshToken',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
      jest.spyOn(usersService, 'delete').mockResolvedValue(user);

      const mockResponse = { send: jest.fn() };
      await controller.deleteUser('1', mockResponse);

      expect(usersService.delete).toHaveBeenCalledWith('1');
      expect(response.send).toHaveBeenCalledWith({
        res: mockResponse,
        statusCode: 200,
        message: 'User deleted successfully',
      });
    });

    it('should handle errors', async () => {
      jest.spyOn(usersService, 'delete').mockRejectedValue(new Error('Database error'));

      const mockResponse = { send: jest.fn() };

      await expect(controller.deleteUser('1', mockResponse)).rejects.toThrow('Database error');
    });
  });
});
