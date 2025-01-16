"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2 = require("argon2");
const token_service_1 = require("../token/token.service");
const mail_service_1 = require("../mail/mail.service");
const mail_helpers_1 = require("../mail/mail.helpers");
const link_util_1 = require("../utils/link.util");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, mailService, tokenService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.tokenService = tokenService;
    }
    async sendEmailVerificationEmail(email, token) {
        const verificationLink = (0, link_util_1.generateLink)({
            endpoint: '/verify-email',
            query: { token },
        });
        const subject = 'Email Verification';
        const content = (0, mail_helpers_1.generateVerificationEmailContent)(verificationLink);
        await this.mailService.sendEmail(email, subject, content);
    }
    async find(className, criteria) {
        common_1.Logger.log(`finding user...`, className.name);
        const whereCriteria = {
            OR: Object.entries(criteria)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => ({ [key]: value })),
        };
        common_1.Logger.log('Where condition:', whereCriteria, className.name);
        if (!whereCriteria.OR.length) {
            common_1.Logger.error('Invalid criteria', className.name);
            throw new common_1.BadRequestException('Invalid criteria');
        }
        const user = await this.prisma.user.findFirst({ where: whereCriteria });
        if (user) {
            common_1.Logger.log('User found', className.name);
            return user;
        }
        common_1.Logger.log('User not found', className.name);
        return null;
    }
    async create(data) {
        common_1.Logger.log('Received request to create user', UsersService_1.name);
        common_1.Logger.log('Checking for email or username conflicts...', UsersService_1.name);
        const username = data.username || `${data.email.split('@')[0]}_${Date.now()}`;
        const userExists = await this.find(UsersService_1, {
            email: data.email,
            username,
        });
        if (userExists && userExists.email === data.email) {
            common_1.Logger.error('Email already exists', UsersService_1.name);
            throw new common_1.BadRequestException('Email already exists');
        }
        if (userExists && userExists.username === username) {
            common_1.Logger.error('Username already exists', UsersService_1.name);
            throw new common_1.BadRequestException('Username already exists');
        }
        const hashedPassword = await argon2.hash(data.password);
        const token = await this.tokenService.generate(data.email);
        const transaction = await this.prisma.$transaction(async (prisma) => {
            try {
                const user = await prisma.user.create({
                    data: {
                        ...data,
                        password: hashedPassword,
                        username,
                    },
                });
                await this.sendEmailVerificationEmail(user.email, token);
                common_1.Logger.log('Email verification email sent', UsersService_1.name);
                const { accessToken, refreshToken } = await this.tokenService.authTokens(user.id);
                const hashedRefreshToken = await argon2.hash(refreshToken);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: hashedRefreshToken },
                });
                common_1.Logger.log('Refresh token persisted', UsersService_1.name);
                const details = this.stripSensitiveFields(user);
                return { details, accessToken, refreshToken };
            }
            catch (error) {
                common_1.Logger.error(error.message, error.stack, UsersService_1.name);
                throw new common_1.InternalServerErrorException(error.message);
            }
        }, { timeout: 10000 });
        common_1.Logger.log('User created', UsersService_1.name);
        return transaction;
    }
    async verifyEmail(token) {
        common_1.Logger.log('Received request to verify email verification token', UsersService_1.name);
        const id = await this.tokenService.verify(token);
        common_1.Logger.log(`Token verified for user with id ${id}`, UsersService_1.name);
        const { email, username, emailIsVerified } = await this.prisma.user.update({
            where: { id },
            data: { emailIsVerified: true },
        });
        common_1.Logger.log(`${username} email verified`, UsersService_1.name);
        return { id, email, username, emailIsVerified };
    }
    async findAll() {
        common_1.Logger.log('Finding all users...', UsersService_1.name);
        try {
            const users = await this.prisma.user.findMany();
            common_1.Logger.log(`Found ${users.length} users`, UsersService_1.name);
            return users.map((user) => this.stripSensitiveFields(user));
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersService_1.name);
            throw error;
        }
    }
    async update(userId, data) {
        common_1.Logger.log(`Updating user with id ${userId}`, UsersService_1.name);
        try {
            common_1.Logger.log('Updating user...', UsersService_1.name);
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data,
            });
            common_1.Logger.log(`User updated: ${updated}`, UsersService_1.name);
            return this.stripSensitiveFields(updated);
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersService_1.name);
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async delete(id) {
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        }
        catch (error) {
            common_1.Logger.error(error.message, error.stack, UsersService_1.name);
            throw new common_1.InternalServerErrorException('Error deleting user');
        }
    }
    async validateRefreshToken(token) {
        const userId = await this.tokenService.verify(token);
        const user = await this.find(UsersService_1, { id: userId });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const isValid = await argon2.verify(user.refreshToken, token);
        if (!isValid)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        return userId;
    }
    stripSensitiveFields(user) {
        const { password, refreshToken, ...rest } = user;
        return rest;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        token_service_1.TokenService])
], UsersService);
//# sourceMappingURL=users.service.js.map