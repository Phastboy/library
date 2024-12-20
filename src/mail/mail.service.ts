import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    this.logger.log(`Sending email to ${to}...`);
    try {
      const info = await this.mailerService.sendMail({
        to,
        subject,
        html: content,
      });
      this.logger.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
