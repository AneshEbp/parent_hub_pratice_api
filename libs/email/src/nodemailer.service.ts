import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailService } from './email.service.interface';

@Injectable()
export class NodeMailerService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private readonly mailerConfig: {
    host: string;
    secure: boolean;
    service: string;
    port: number;
    auth: { user: string; pass: string };
  };

  constructor(
    @Inject(forwardRef(() => ConfigService))
    private readonly configService: ConfigService,
  ) {
    this.mailerConfig = {
      host: this.configService.get('EMAIL_HOST'),
      secure: true,
      service: 'gmail',
      port: 587,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_USER_PASS'),
      },
    };

    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport(this.mailerConfig);
  }

  async sendEmail({
    email,
    subject,
    template,
  }: {
    email: string;
    subject: string;
    template: string;
  }): Promise<string> {
    const info = await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject,
      html: template,
    });

    return info.messageId;
  }
}
