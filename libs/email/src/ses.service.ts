// @app/common/services/aws/ses.service.ts

import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { IEmailService } from './email.service.interface';

@Injectable()
export class SesService implements IEmailService {
  private readonly ses: AWS.SES;

  constructor() {
    this.ses = new AWS.SES({ region: process.env.AWS_REGION });
  }

  async sendEmail({
    email,
    subject,
    template,
  }: {
    email: string;
    subject: string;
    template: string;
  }): Promise<AWS.SES.SendEmailResponse> {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: { Data: template },
        },
        Subject: { Data: subject },
      },
      Source: process.env.AWS_SES_SOURCE_EMAIL,
    };

    return this.ses.sendEmail(params).promise();
  }
}
