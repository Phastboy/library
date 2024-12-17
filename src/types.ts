export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface RequestPayload {
    id: string;
    email: string;
    username: string;
    role: Role;
    emailIsVerified: boolean;
}

export interface ResponsePayload extends RequestPayload {
    iat: number;
    exp: number;
}