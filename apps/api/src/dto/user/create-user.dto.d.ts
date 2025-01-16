import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    username: string;
    password: string;
    role?: Role;
    phoneNumber?: string;
    emailIsVerified?: boolean;
    refreshToken?: string;
}
