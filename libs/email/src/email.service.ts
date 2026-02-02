import { Injectable, Inject } from '@nestjs/common';
import { EmailTemplateRepository } from '@app/data-access';
import { replacePlaceholders, generateEmailTemplate } from '@app/common/helpers/template-helper';
import { IEmailService } from './email.service.interface';
import { RequestedFor } from '@app/common/enum/otp-request.enum';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
    @Inject('EmailService') private readonly iEmailService: IEmailService,
  ) {}

  async sendEmail({
    to,
    values,
    slug,
  }: {
    to: string;
    values: any;
    slug: RequestedFor;
  }): Promise<boolean> {
    const templateData = await this.emailTemplateRepository.findOne({ slug });

    if (!templateData) {
      return false;
    }

    const content = replacePlaceholders(templateData.body, values);
    const htmlContent = generateEmailTemplate(content);


    await this.iEmailService.sendEmail({
      email: to,
      subject: templateData.subject,
      template: htmlContent,
    });
    return true;
  }
}
