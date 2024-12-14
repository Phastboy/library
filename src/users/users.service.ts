import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async generateEmailVerificationToken(email: string) {
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

  async sendEmailVerificationEmail(email: string, token: string) {
    Logger.log('Received request to send email verification email', UsersService.name);
    // Create a transporter
    Logger.log('Creating transporter...', UsersService.name);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
    });
    if (!transporter) {
      Logger.error('Error creating transporter', UsersService.name);
      throw new InternalServerErrorException('Error sending email');
    }
    Logger.log('Transporter created', UsersService.name);

    // Send the email
    Logger.log('Sending email...', UsersService.name);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}` || 'http://localhos:8080/api/auth';
    if (!verificationLink) {
      Logger.error('Error creating verification link', UsersService.name);
      throw new InternalServerErrorException('Error sending email');
    }
    try {
      const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Email Verification',
      text: `Click the following link to verify your email: ${verificationLink}/verify-email?token=${token}`,
      });
      Logger.log(`Email sent: ${info.messageId}`, UsersService.name);
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
