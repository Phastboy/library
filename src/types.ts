export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    email: string;
    id: string;
    username: string;
    role: Role;
    phoneNumber: string | null;
    emailIsVerified: boolean;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Payload {
    userId: string;
    iat: number;
    exp: number;
}
export interface UserCriteria {
    email?: string;
    username?: string;
    refreshToken?: string;
    id?: string;
  }