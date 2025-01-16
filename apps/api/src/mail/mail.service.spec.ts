import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { InternalServerErrorException } from '@nestjs/common';

describe('MailService', () => {
    let service: MailService;
    let mailerService: MailerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MailService>(MailService);
        mailerService = module.get<MailerService>(MailerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendEmail', () => {
        it('should send an email successfully', async () => {
            const to = 'test@example.com';
            const subject = 'Test Subject';
            const content = '<p>Test Content</p>';

            jest.spyOn(mailerService, 'sendMail').mockResolvedValue({
                messageId: '12345',
            });

            await service.sendEmail(to, subject, content);

            expect(mailerService.sendMail).toHaveBeenCalledWith({
                to,
                subject,
                html: content,
            });
        });

        it('should throw an InternalServerErrorException if email sending fails', async () => {
            const to = 'test@example.com';
            const subject = 'Test Subject';
            const content = '<p>Test Content</p>';

            jest.spyOn(mailerService, 'sendMail').mockRejectedValue(
                new Error('Failed to send email'),
            );

            await expect(
                service.sendEmail(to, subject, content),
            ).rejects.toThrow(
                new InternalServerErrorException('Failed to send email'),
            );
        });
    });
});
