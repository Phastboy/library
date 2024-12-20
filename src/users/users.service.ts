import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { TokenService } from 'src/token/token.service';
import { User, Payload, UserCriteria, Profile } from 'src/types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService,
    private tokenService: TokenService,
  ) {}

  async find(className: any, criteria: UserCriteria) {
    Logger.log(`finding user...`, className.name);
    // Filter out undefined fields
    const whereCriteria = {
      OR: Object.entries(criteria)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => ({ [key]: value })),
    };
    Logger.log('Where condition:', whereCriteria, className.name);
    if (!whereCriteria.OR.length) {
      Logger.error('Invalid criteria', className.name);
      throw new BadRequestException('Invalid criteria');
    }

    const user = await this.prisma.user.findFirst({ where: whereCriteria });
    if (user) {
      Logger.log('User found', className.name);
      return user;
    }
    Logger.log('User not found', className.name);
    return null;
  }

  async create(data: CreateUserDto) {
    Logger.log('Received request to create user', UsersService.name);

    // Check for email and username
    Logger.log(
      'Checking for email or username conflicts...',
      UsersService.name,
    );
    const username =
      data.username || `${data.email.split('@')[0]}_${Date.now()}`;
    const user = await this.find(UsersService, { email: data.email, username });
    if (user && user.email === data.email) {
      Logger.error('Email already exists', UsersService.name);
      throw new BadRequestException('Email already exists');
    }
    if (user && user.username === username) {
      Logger.error('Username already exists', UsersService.name);
      throw new BadRequestException('Username already exists');
    }

    // Hash the password and create the user
    const hashedPassword = await argon2.hash(data.password);
    try {
      const { password, ...result } = await this.prisma.user.create({
        data: {
          email: data.email,
          username,
          password: hashedPassword,
        },
      });
      Logger.log('User created successfully', UsersService.name);

      return result as User;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new BadRequestException('Error creating user');
    }
  }

  async generateEmailVerificationToken(payload: User): Promise<string> {
    Logger.log(
      'Received request to generate email verification token',
      UsersService.name,
    );
    try {
      // Check if the user exists
      Logger.log('Checking if user exists...', UsersService.name);
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!user) {
        Logger.error('User not found', UsersService.name);
        throw new BadRequestException('User not found');
      }
      Logger.log('User found', UsersService.name);

      // Generate the token
      Logger.log('Generating token...', UsersService.name);
      const token = await this.tokenService.generate(
        payload,
        UsersService,
        '1h',
      );
      Logger.log('Token generated', UsersService.name);
      return token;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException(
        'Error generating email verification token',
      );
    }
  }

  async verifyEmailVerificationToken(token: string) {
    Logger.log(
      'Received request to verify email verification token',
      UsersService.name,
    );
    if (!token || typeof token !== 'string') {
      Logger.error(
        'Invalid token: Token is required and must be a string',
        UsersService.name,
      );
      throw new BadRequestException('Invalid token');
    }
    try {
      // Verify the token
      Logger.log('Verifying token...', UsersService.name);
      const payload = await this.tokenService.verify(token, UsersService);
      Logger.log(`Token verified: ${payload.userId}`, UsersService.name);

      // update the user's email verification status
      Logger.log(
        'Updating user email verification status...',
        UsersService.name,
      );
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { emailIsVerified: true },
      });
      return payload;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token has expired');
      }
      throw new BadRequestException('Invalid token');
    }
  }

  private generateVerificationLink(token: string): string {
    const baseUrl = process.env.API_URL || 'http://localhost:8080';
    const url = new URL('/verify-email', baseUrl);
    url.searchParams.set('token', token);
    Logger.log('Verification link:', url.toString());
    return url.toString();
  }

  async sendEmail(email: string, subject: string, content: string) {
    Logger.log('Sending email...');

    try {
      const info = await this.mailerService.sendMail({
        from: process.env.SMTP_FROM || 'stationphast@gmail.com',
        to: email,
        subject,
        html: content,
      });
      Logger.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
      Logger.error('Error sending email', error.stack);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  private generateEmailTemplate(content: string): string {
    return `
        <body style="font-family: Arial, sans-serif; text-align: center;">
            ${content}
        </body>
    `;
  }

  async sendEmailVerificationEmail(email: string, token: string) {
    Logger.log('Preparing to send verification email...');
    const verificationLink = this.generateVerificationLink(token);

    const subject = 'Email Verification';
    const content = this.generateEmailTemplate(`
        <h1>Welcome to MyLibrary!</h1>
        <p>Please click the button below to verify your email address</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          <button style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
            Verify Email
          </button>
        </a>
    `);

    await this.sendEmail(email, subject, content);
  }

  async findAll() {
    Logger.log('Finding all users...', UsersService.name);
    try {
      const users = await this.prisma.user.findMany();
      Logger.log(`Found ${users.length} users`, UsersService.name);
      return users;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw error;
    }
  }

  async update(userId: string, data: UpdateUserDto): Promise<Profile> {
    Logger.log(`Updating user with id ${userId}`, UsersService.name);
    try {
      Logger.log('Updating user...', UsersService.name);
      const { id, password, refreshToken, ...update } =
        await this.prisma.user.update({
          where: { id: userId },
          data,
        });
      Logger.log(`User updated: ${update}`, UsersService.name);
      return update;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(id: string, className: any) {
    try {
      Logger.log('Deleting user...', className.name);
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
