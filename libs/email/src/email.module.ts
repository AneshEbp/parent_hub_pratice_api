import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { NodeMailerService } from './nodemailer.service';
import { SesService } from './ses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplate, EmailTemplateRepository, EmailTemplateSchema } from '@app/data-access';

@Global()
@Module({})
export class EmailModule {
  static forRoot(): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        ConfigModule,
        MongooseModule.forFeature([
          {
            name: EmailTemplate.name,
            schema: EmailTemplateSchema,
          },
        ]),
      ],
      providers: [
        {
          provide: 'EmailService',
          useFactory: (configService: ConfigService) => {
            const isProduction = configService.get('APP_ENV') === 'production';
            return isProduction ? new SesService() : new NodeMailerService(configService);
          },
          inject: [ConfigService],
        },
        EmailService,
        EmailTemplateRepository,
      ],
      exports: ['EmailService', EmailService],
    };
  }
}
