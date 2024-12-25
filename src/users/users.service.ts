import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { TokenService } from '../token/token.service';
import { UserCriteria, Profile } from 'src/types';
import { MailService } from '../mail/mail.service';
import { generateVerificationEmailContent } from '../mail/mail.helpers';
import { generateLink } from '../utils/link.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  async sendEmailVerificationEmail(email: string, token: string) {
    const verificationLink = generateLink({
      endpoint: '/verify-email',
      query: { token },
    });
    const subject = 'Email Verification';
    const content = generateVerificationEmailContent(verificationLink);

    await this.mailService.sendEmail(email, subject, content);
  }

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

  // try to make this atomic
  async create(data: CreateUserDto) {
    Logger.log('Received request to create user', UsersService.name);

    // Check for email and username
    Logger.log(
      'Checking for email or username conflicts...',
      UsersService.name,
    );
    const username =
      data.username || `${data.email.split('@')[0]}_${Date.now()}`;
    const userExists = await this.find(UsersService, {
      email: data.email,
      username,
    });
    if (userExists && userExists.email === data.email) {
      Logger.error('Email already exists', UsersService.name);
      throw new BadRequestException('Email already exists');
    }
    if (userExists && userExists.username === username) {
      Logger.error('Username already exists', UsersService.name);
      throw new BadRequestException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await argon2.hash(data.password);

    // Generate email verification token
    const token = await this.tokenService.generate(data.email);

    // Perform all operations within a single transaction
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        // Create the user
        const user = await prisma.user.create({
          data: {
            ...data,
            password: hashedPassword,
            username,
          },
        });

        // Send email verification email
        await this.sendEmailVerificationEmail(user.email, token);
        Logger.log('Email verification email sent', UsersService.name);

        // generate auth tokens
        const { accessToken, refreshToken } =
          await this.tokenService.authTokens(user.id);

        // persist refresh token with argon2 hash
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: hashedRefreshToken },
        });
        Logger.log('Refresh token persisted', UsersService.name);

        // strip sensitive fields
        const details = this.stripSensitiveFields(user);

        return { details, accessToken, refreshToken };
      } catch (error) {
        Logger.error(error.message, error.stack, UsersService.name);
        throw new InternalServerErrorException(
          'Error creating user',
          error.message,
        );
      }
    }, { timeout: 10000 });

    Logger.log('User created', UsersService.name);
    return transaction;
  }

  async verifyEmail(token: string) {
    Logger.log(
      'Received request to verify email verification token',
      UsersService.name,
    );
    const id = await this.tokenService.verify(token);
    Logger.log(`Token verified for user with id ${id}`, UsersService.name);
    // update the user's email verification status
    const { email, username, emailIsVerified } = await this.prisma.user.update({
      where: { id },
      data: { emailIsVerified: true },
    });
    Logger.log(`${username} email verified`, UsersService.name);
    return { id, email, username, emailIsVerified };
  }

  async findAll() {
    Logger.log('Finding all users...', UsersService.name);
    try {
      const users = await this.prisma.user.findMany();
      Logger.log(`Found ${users.length} users`, UsersService.name);
      return users.map((user) => this.stripSensitiveFields(user));
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

  async delete(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async validateRefreshToken(token: string): Promise<string> {
    const userId = await this.tokenService.verify(token);
    const user = await this.find(UsersService, { id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await argon2.verify(user.refreshToken, token);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    return userId;
  }

  private stripSensitiveFields(user: any) {
    const { password, refreshToken, ...rest } = user;
    return rest;
  }
}
