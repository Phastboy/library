import { RefreshGuard } from './refresh.guard';
import { TokenService } from '../token/token.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('RefreshGuard', () => {
    let refreshGuard: RefreshGuard;
    let tokenService: TokenService;
    let usersService: UsersService;

    beforeEach(() => {
        tokenService = {
            extractTokenFromCookie: jest.fn(),
            verify: jest.fn(),
        } as any;
        usersService = {
            validateRefreshToken: jest.fn(),
        } as any;
        refreshGuard = new RefreshGuard(tokenService, usersService);
    });

    it('should be defined', () => {
        expect(refreshGuard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true if refresh token is valid', async () => {
            const mockRequest = {
                headers: {
                    cookie: 'refreshToken=validToken',
                },
                userId: undefined,
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;

            jest.spyOn(tokenService, 'extractTokenFromCookie').mockReturnValue(
                'validToken',
            );
            jest.spyOn(usersService, 'validateRefreshToken').mockResolvedValue(
                'userId',
            );

            const result = await refreshGuard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(tokenService.extractTokenFromCookie).toHaveBeenCalledWith(
                'refreshToken=validToken',
                'refreshToken',
            );
            expect(usersService.validateRefreshToken).toHaveBeenCalledWith(
                'validToken',
            );
            expect(mockRequest.userId).toBe('userId');
        });

        it('should throw an UnauthorizedException if refresh token is not found', async () => {
            const mockRequest = {
                headers: {
                    cookie: '',
                },
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;

            jest.spyOn(tokenService, 'extractTokenFromCookie').mockReturnValue(
                null,
            );

            await expect(refreshGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException('Refresh token not found'),
            );
        });

        it('should throw an UnauthorizedException if refresh token is invalid', async () => {
            const mockRequest = {
                headers: {
                    cookie: 'refreshToken=invalidToken',
                },
            };
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;

            jest.spyOn(tokenService, 'extractTokenFromCookie').mockReturnValue(
                'invalidToken',
            );
            jest.spyOn(usersService, 'validateRefreshToken').mockRejectedValue(
                new Error('Invalid token'),
            );

            await expect(refreshGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException('Invalid token'),
            );
        });
    });
});
