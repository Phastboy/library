import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private mailerService: MailerService) {}

  private readonly secret = () => {
      const secret = process.env.JWT_SECRET ?? 'development';
      if (secret === 'development') {
          Logger.warn('cannot find JWT secret in environment variables', UsersService.name);
          Logger.warn('Using default JWT secret', UsersService.name);
      }
      return secret;
  }

  async create(data: CreateUserDto) {
    Logger.log('Received request to create user', UsersService.name);
    // Check if the email is already in use
    Logger.log('Checking if email is already in use...', UsersService.name);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    Logger.log('Check complete', UsersService.name);
    if (existingUser) {
      Logger.error('Email already in use', UsersService.name);
      throw new BadRequestException('The email address is already associated with an account.');
    }
    Logger.log('Email is not associated to any account', UsersService.name);

    // Hash the password and Create the user
    const hashedPassword = await argon2.hash(data.password);
    try {
      Logger.log('Creating user...', UsersService.name);
      const { password, ...result } = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.email.split('@')[0], // Default username based on email
          password: hashedPassword,
        },
      });
      Logger.log('User created successfully', UsersService.name);

      return result;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new BadRequestException('Error creating user');
    }
  }

  async generateEmailVerificationToken(email: string, id: string) {
    Logger.log('Received request to generate email verification token', UsersService.name);
    // Check if the user exists
    Logger.log('Checking if user exists...', UsersService.name);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      Logger.error('User not found', UsersService.name);
      throw new BadRequestException('User not found');
    }
    Logger.log('User found', UsersService.name);

    // Generate the token
    Logger.log('Generating token...', UsersService.name);
    const token = jwt.sign({ email }, this.secret(), { expiresIn: '1h' });
    Logger.log('Token generated', UsersService.name);
    return token;
  }

  async verifyEmailVerificationToken(token: string) {
    Logger.log('Received request to verify email verification token', UsersService.name);
    try {
      // Verify the token
      Logger.log('Verifying token...', UsersService.name);
      const decoded = jwt.verify(token, this.secret);
      Logger.log('Token verified', UsersService.name);
      return decoded;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new BadRequestException('Invalid token');
    }
  }

  private generateVerificationLink(token: string): string {
    Logger.log('Generating verification link...');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080/api/auth';
    return `${frontendUrl}/verify-email?token=${token}`;
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
  
  async sendEmailVerificationEmail(email: string, token: string) {
    Logger.log('Preparing to send verification email...');
    const verificationLink = this.generateVerificationLink(token);

    const subject = 'Email Verification';
    const content = `
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h1> Welcome to Library Management System </h1>
        <p style="font-size: 1.2em;"> Please verify your email address to complete your registration </p>
        <button style="background-color: #4CAF50; padding: 10px 20px; color: white; border: none; border-radius: 5px;">
          <a href="${verificationLink}"> Verify Email </a>
        </button>
      </body>
    `;

    await this.sendEmail(email, subject, content);
  }
}
