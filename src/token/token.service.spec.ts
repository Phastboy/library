import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('generate', () => {
    it('should generate a token', async () => {
      const userId = '123';
      const token = 'token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.generate(userId);

      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId },
        { secret: expect.any(String), expiresIn: expect.any(String) },
      );
    });
  });

  describe('authTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = '123';
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.authTokens(userId);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId },
        { secret: expect.any(String), expiresIn: expect.any(String) },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId },
        { secret: expect.any(String), expiresIn: expect.any(String) },
      );
    });
  });

  describe('verify', () => {
    it('should verify a token', async () => {
      const token = 'token';
      const userId = '123';
      jest.spyOn(jwtService, 'verify').mockReturnValue({ userId });

      const result = await service.verify(token);

      expect(result).toBe(userId);
      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: expect.any(String),
      });
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const token = 'token';
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });

      await expect(service.verify(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is malformed', async () => {
      const token = 'token';
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw { name: 'JsonWebTokenError' };
      });

      await expect(service.verify(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'token';
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(service.verify(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromCookie', () => {
    it('should extract token from cookie', () => {
      const cookie = 'accessToken=token; refreshToken=refreshToken';
      const tokenKey = 'accessToken';

      const result = service.extractTokenFromCookie(cookie, tokenKey);

      expect(result).toBe('token');
    });

    it('should return null if cookie is undefined', () => {
      const result = service.extractTokenFromCookie(undefined, 'accessToken');

      expect(result).toBeNull();
    });

    it('should return null if token is not found in cookie', () => {
      const cookie = 'refreshToken=refreshToken';
      const tokenKey = 'accessToken';

      const result = service.extractTokenFromCookie(cookie, tokenKey);

      expect(result).toBeNull();
    });
  });

  describe('getSecret', () => {
    it('should return the secret', () => {
      process.env.JWT_SECRET = 'secret';

      const result = (service as any).getSecret();

      expect(result).toBe('secret');
    });

    it('should throw InternalServerErrorException if secret is not set', () => {
      delete process.env.JWT_SECRET;

      expect(() => (service as any).getSecret()).toThrow(
        InternalServerErrorException,
      );
    });
  });
});
