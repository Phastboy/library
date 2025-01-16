import { AuthGuard } from './auth.guard';
import { TokenService } from '../token/token.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
    let authGuard: AuthGuard;
    let tokenService: TokenService;

    beforeEach(() => {
        tokenService = {
            extractTokenFromCookie: jest.fn(),
            verify: jest.fn(),
        } as any;
        authGuard = new AuthGuard(tokenService);
    });

    it('should be defined', () => {
        expect(authGuard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true if token is valid', async () => {
            const mockRequest = {
                headers: {
                    cookie: 'accessToken=validToken',
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
            jest.spyOn(tokenService, 'verify').mockResolvedValue('userId');

            const result = await authGuard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(tokenService.extractTokenFromCookie).toHaveBeenCalledWith(
                'accessToken=validToken',
                'accessToken',
            );
            expect(tokenService.verify).toHaveBeenCalledWith('validToken');
            expect(mockRequest.userId).toBe('userId');
        });

        it('should throw an UnauthorizedException if token is not found', async () => {
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

            await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException('Access token not found'),
            );
        });

        it('should throw an UnauthorizedException if token is invalid', async () => {
            const mockRequest = {
                headers: {
                    cookie: 'accessToken=invalidToken',
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
            jest.spyOn(tokenService, 'verify').mockRejectedValue(
                new Error('Invalid token'),
            );

            await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
                new UnauthorizedException('Invalid token'),
            );
        });
    });
});
