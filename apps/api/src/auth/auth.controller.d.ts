import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { TokenService } from '../token/token.service';
import { Response } from 'express';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth/password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly tokenService;
    constructor(authService: AuthService, tokenService: TokenService);
    create(createUserDto: CreateUserDto, res: Response): Promise<void>;
    verifyEmail(token: string, res: Response): Promise<void>;
    login(loginDto: LoginDto, res: Response): Promise<void>;
    refreshTokens(req: any, res: Response): Promise<void>;
    logout(req: any, res: Response): Promise<void>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto, res: Response): Promise<void>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, res: Response): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto, token: string, res: Response): Promise<void>;
}
