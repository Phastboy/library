export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface Payload {
    id: string;
    email: string;
    username: string;
    role: Role;
}