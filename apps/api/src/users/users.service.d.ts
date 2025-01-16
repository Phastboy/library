import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { TokenService } from '../token/token.service';
import { UserCriteria, Profile } from 'src/types';
import { MailService } from '../mail/mail.service';
export declare class UsersService {
    private readonly prisma;
    private readonly mailService;
    private readonly tokenService;
    constructor(prisma: PrismaService, mailService: MailService, tokenService: TokenService);
    sendEmailVerificationEmail(email: string, token: string): Promise<void>;
    find(className: any, criteria: UserCriteria): Promise<{
        email: string;
        username: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        emailIsVerified: boolean;
        refreshToken: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: CreateUserDto): Promise<{
        details: any;
        accessToken: Tokens;
        refreshToken: Tokens;
    }>;
    verifyEmail(token: string): Promise<{
        id: string;
        email: string;
        username: string;
        emailIsVerified: boolean;
    }>;
    findAll(): Promise<any[]>;
    update(userId: string, data: UpdateUserDto): Promise<Profile>;
    delete(id: string): Promise<{
        email: string;
        username: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        emailIsVerified: boolean;
        refreshToken: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateRefreshToken(token: string): Promise<string>;
    stripSensitiveFields(user: any): any;
}
