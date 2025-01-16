import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UsersService } from '../users/users.service';
import { Tokens } from '../types';
import { LoginDto } from '../dto/auth/login.dto';
import * as argon2 from 'argon2';
import { TokenService } from '../token/token.service';
import { ChangePasswordDto } from '../dto/auth/password.dto';
import { MailService } from '../mail/mail.service';
import { generateLink } from '../utils/link.util';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private tokenService: TokenService,
        private mailService: MailService,
    ) {}

    public cookieOptions = {
        httpOnly: true,
        secure: this.tokenService.isProduction(),
        sameSite: this.tokenService.isProduction() ? 'none' : 'lax',
        path: '/',
    };

    async create(createUserDto: CreateUserDto) {
        Logger.log('registering user...', AuthService.name);
        return await this.userService.create(createUserDto);
    }

    // login
    async login(data: LoginDto) {
        Logger.log('Received request to login', AuthService.name);
        try {
            const user = await this.userService.find(AuthService, {
                email: data.email,
            });
            if (!user) {
                throw new BadRequestException('Invalid email');
            }
            const isPasswordValid = await argon2.verify(
                user.password,
                data.password,
            );
            if (!isPasswordValid) {
                throw new BadRequestException('Invalid password');
            }

            // generate tokens
            const { accessToken, refreshToken } =
                await this.tokenService.authTokens(user.id);

            // persist refresh token with argon2 hash
            const hashedRefreshToken = await argon2.hash(refreshToken);
            await this.userService.update(user.id, {
                refreshToken: hashedRefreshToken,
            });
            Logger.log(
                `Login successful for user with email ${data.email}`,
                AuthService.name,
            );

            return { accessToken, refreshToken };
        } catch (error: any) {
            Logger.error(error.message, error.stack, AuthService.name);
            throw error;
        }
    }

    async verifyEmail(token: string) {
        Logger.log('Received request to verify email', AuthService.name);
        try {
            const data = await this.userService.verifyEmail(token);
            if (data) {
                return data;
            }
        } catch (error: any) {
            Logger.error(error.message, error.stack, AuthService.name);
            throw error;
        }
    }

    async refreshTokens(userId: string): Promise<Tokens> {
        Logger.log('Received request to refresh tokens', AuthService.name);
        try {
            // generate new tokens
            const { accessToken, refreshToken } =
                await this.tokenService.authTokens(userId);

            // persist refresh token with argon2 hash
            const hashedRefreshToken = await argon2.hash(refreshToken);
            const id = userId;
            await this.userService.update(id, {
                refreshToken: hashedRefreshToken,
            });
            Logger.log(
                `Tokens refreshed successfully for user with id ${id}`,
                AuthService.name,
            );

            return { accessToken, refreshToken };
        } catch (error: any) {
            Logger.error(error.message, error.stack, AuthService.name);
            throw error;
        }
    }

    async logout(accessToken: string) {
        Logger.log('Received request to logout', AuthService.name);
        try {
            const decoded = await this.tokenService.verify(accessToken);
            const user = await this.userService.find(AuthService, {
                id: decoded,
            });
            if (!user) {
                throw new BadRequestException('Invalid user');
            }
            await this.userService.update(user.id, { refreshToken: null });
            Logger.log(
                `Logout successful for user with email ${user.id}`,
                AuthService.name,
            );
            return {
                message: 'Logout successful',
            };
        } catch (error: any) {
            Logger.error(error.message, error.stack, AuthService.name);
            throw error;
        }
    }

    async forgotPassword(email: string) {
        const user = await this.userService.find(AuthService, { email });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const token = await this.tokenService.generate(user.id);
        const resetLink = generateLink({
            endpoint: '/reset-password',
            query: { token },
        });

        await this.mailService.sendEmail(
            email,
            'Password Reset Request',
            `Click the link to reset your password: ${resetLink}`,
        );
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.userService.find(AuthService, { id: userId });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await argon2.verify(
            user.password,
            changePasswordDto.currentPassword,
        );
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // check if new password is the same as the current password
        const newPasswordIsCurrentPassword = await argon2.verify(
            user.password,
            changePasswordDto.newPassword,
        );
        if (newPasswordIsCurrentPassword) {
            throw new BadRequestException(
                'New password cannot be the same as the current password',
            );
        }
        const hashedPassword = await argon2.hash(changePasswordDto.newPassword);
        await this.userService.update(userId, { password: hashedPassword });
    }

    async resetPassword(token: string, newPassword: string) {
        const userId = await this.tokenService.verify(token);
        const user = await this.userService.find(AuthService, { id: userId });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const hashedPassword = await argon2.hash(newPassword);
        await this.userService.update(userId, { password: hashedPassword });
    }
}
