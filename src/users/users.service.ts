import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { TokenService } from 'src/token/token.service';
import { RequestPayload, ResponsePayload } from 'src/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private mailerService: MailerService, private tokenService: TokenService) {}

  async userExists(email: string, className: any, username?: string) {
    Logger.log('Checking if user exists...', UsersService.name);
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });
      if (user) {
        Logger.log('User exists', className.name);
        return user;
      }
      Logger.log('User does not exist', className.name);
      throw new BadRequestException('User does not exist');
    } finally {
      Logger.log('completed checking if user exists', className.name);
    }
  }

  async create(data: CreateUserDto) {
    Logger.log('Received request to create user', UsersService.name);
    // Check if the email is already in use
    Logger.log('Checking if email is already in use...', UsersService.name);
    const user = await this.userExists(data.email, UsersService, data.username);
    if (user && user.email === data.email) {
      Logger.error('Email is already associated to an account', UsersService.name);
      throw new BadRequestException('Email is already associated to an account');
    }
    if (user && user.username === data.username) {
      Logger.error('Username is already associated to an account', UsersService.name);
      throw new BadRequestException('Username is already associated to an account');
    }
    Logger.log('Email is not associated to any account', UsersService.name);

    // Hash the password and Create the user
    const hashedPassword = await argon2.hash(data.password);
    try {
      Logger.log('Creating user...', UsersService.name);
      const { password, ...result } = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username || data.email.split('@')[0],
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

  async generateEmailVerificationToken(payload: RequestPayload): Promise<string> {
    Logger.log('Received request to generate email verification token', UsersService.name);
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
      const token = await this.tokenService.generate(payload, UsersService, '1h');
      Logger.log('Token generated', UsersService.name);
      return token;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error generating email verification token');
    }
  }

  async verifyEmailVerificationToken(token: string) {
    Logger.log('Received request to verify email verification token', UsersService.name);
    if (!token || typeof token !== 'string') {
      Logger.error('Invalid token: Token is required and must be a string', UsersService.name);
      throw new BadRequestException('Invalid token');
    }
    try {
      // Verify the token
      Logger.log('Verifying token...', UsersService.name);
      const decoded = await this.tokenService.verify(token, UsersService);
      Logger.log(`Token verified: ${decoded}`, UsersService.name);

      // update the user's email verification status
      Logger.log('Updating user email verification status...', UsersService.name);
      const data = decoded as jwt.JwtPayload & ResponsePayload;
      Logger.log('Decoded token:', data, UsersService.name);
      await this.prisma.user.update({
        where: { email: data.email },
        data: { emailIsVerified: true },
      });
      return data;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      if(error.name === 'TokenExpiredError') {
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

  async findAll(){
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

  async findOne(id: string){
    Logger.log(`Finding user with id ${id}`, UsersService.name);
    try {
      Logger.log('Finding user...', UsersService.name);
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (user === null) {
        Logger.error('User not found', UsersService.name);
        throw new BadRequestException('User not found');
      }
      Logger.log(`User found: ${user.email}`, UsersService.name);
      return user;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDto){
    Logger.log(`Updating user with id ${id}`, UsersService.name);
    try {
      Logger.log('Updating user...', UsersService.name);
      const update = await this.prisma.user.update({
        where: { id },
        data,
      });
      Logger.log(`User updated: ${update}`, UsersService.name);
      return update;
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(id: string){
    try {
      Logger.log('Deleting user...', UsersService.name);
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      Logger.error(error.message, error.stack, UsersService.name);
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
