import { CreateUserDto } from '../dto/user/create-user.dto';
import { UsersService } from '../users/users.service';
import { Tokens } from '../types';
import { LoginDto } from '../dto/auth/login.dto';
import { TokenService } from '../token/token.service';
import { ChangePasswordDto } from '../dto/auth/password.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private userService;
    private tokenService;
    private mailService;
    constructor(userService: UsersService, tokenService: TokenService, mailService: MailService);
    cookieOptions: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: string;
        path: string;
    };
    create(createUserDto: CreateUserDto): Promise<{
        details: any;
        accessToken: Tokens;
        refreshToken: Tokens;
    }>;
    login(data: LoginDto): Promise<{
        accessToken: Tokens;
        refreshToken: Tokens;
    }>;
    verifyEmail(token: string): Promise<{
        id: string;
        email: string;
        username: string;
        emailIsVerified: boolean;
    }>;
    refreshTokens(userId: string): Promise<Tokens>;
    logout(accessToken: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
