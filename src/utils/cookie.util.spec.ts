import { setAuthCookies } from './cookie.util';
import { Response } from 'express';

describe('setAuthCookies', () => {
  let mockResponse: Partial<Response>;
  const cookieOptions = { httpOnly: true, secure: true };

  beforeEach(() => {
    mockResponse = {
      cookie: jest.fn(),
    };
  });

  it('should set accessToken and refreshToken cookies with correct options', () => {
    const accessToken = 'access-token-example';
    const refreshToken = 'refresh-token-example';

    setAuthCookies(
      mockResponse as Response,
      accessToken,
      refreshToken,
      cookieOptions,
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'accessToken',
      accessToken,
      {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refreshToken',
      refreshToken,
      {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );
  });

  it('should handle missing cookie options gracefully', () => {
    const accessToken = 'access-token-example';
    const refreshToken = 'refresh-token-example';

    setAuthCookies(mockResponse as Response, accessToken, refreshToken, {});

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'accessToken',
      accessToken,
      {
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refreshToken',
      refreshToken,
      {
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );
  });
});
