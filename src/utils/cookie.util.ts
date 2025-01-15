import { Response } from 'express';

export const setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,
    cookieOptions: any,
) => {
    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
