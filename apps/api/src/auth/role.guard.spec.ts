import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RoleGuard', () => {
    let roleGuard: RoleGuard;
    let reflector: Reflector;
    let usersService: UsersService;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        } as any;
        usersService = {
            find: jest.fn(),
        } as any;
        roleGuard = new RoleGuard(reflector, usersService);
    });

    it('should be defined', () => {
        expect(roleGuard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true if no roles are required', async () => {
            const mockRequest = {
                userId: '1',
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any as ExecutionContext;

            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(
                undefined,
            );

            const result = await roleGuard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
                ROLES_KEY,
                [mockContext.getHandler(), mockContext.getClass()],
            );
        });

        it('should return true if user has the required role', async () => {
            const mockRequest = {
                userId: '1',
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any as ExecutionContext;

            const user = {
                id: '1',
                role: Role.admin,
                email: 'example@test.com',
                username: 'testuser',
                password: 'hashedPassword',
                emailIsVerified: true,
                phoneNumber: '1234567890',
                refreshToken: 'refresh-token',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                Role.admin,
            ]);
            jest.spyOn(usersService, 'find').mockResolvedValue(user);

            const result = await roleGuard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
                ROLES_KEY,
                [mockContext.getHandler(), mockContext.getClass()],
            );
            expect(usersService.find).toHaveBeenCalledWith(RoleGuard, {
                id: '1',
            });
        });

        it('should throw an UnauthorizedException if user does not have the required role', async () => {
            const mockRequest = {
                userId: '1',
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any as ExecutionContext;

            const user = {
                id: '1',
                role: Role.user,
                email: 'example@test.com',
                username: 'testuser',
                password: 'hashedPassword',
                emailIsVerified: true,
                phoneNumber: '1234567890',
                refreshToken: 'refresh-token',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                Role.admin,
            ]);
            jest.spyOn(usersService, 'find').mockResolvedValue(user);

            await expect(roleGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException(
                    `You do not have the required role. Required: admin, Your Role: user`,
                ),
            );
        });

        it('should throw an UnauthorizedException if user is not found', async () => {
            const mockRequest = {
                userId: '1',
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any as ExecutionContext;

            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                Role.admin,
            ]);
            jest.spyOn(usersService, 'find').mockResolvedValue(null);

            await expect(roleGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException('User not found'),
            );
        });
    });
});
