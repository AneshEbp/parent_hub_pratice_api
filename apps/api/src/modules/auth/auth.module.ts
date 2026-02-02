import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '@app/authentication';
import { mongooseModels } from './mongoose.models';
import { providers } from './providers';
import { controllers } from './controllers';
import { AuthService } from './services/auth.service';
import { SocialAuthModule } from '@app/social-auth';
import { HttpModule } from '@nestjs/axios';
import { AwsModule } from '@app/common/services/s3/aws.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { EmailModule } from '@app/email/email.module';
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AuthModule
 * @typedef {AuthModule}
 */
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // your translation folder
        watch: true,
      },
      resolvers: [new QueryResolver(['lang']), new AcceptLanguageResolver()],
    }),
    HttpModule,
    AuthenticationModule,
    SocialAuthModule.registerAsync({
      useFactory: () => {
        if (!process.env.APPLE_CLIENT_ID)
          throw new Error('APPLE_CLIENT_ID is missing');
        if (!process.env.GOOGLE_CLIENT_ID)
          throw new Error('GOOGLE_CLIENT_ID is missing');
        return {
          appleClientId: process.env.APPLE_CLIENT_ID.split(','),
          facebookClientSecret: process.env.FACEBOOK_APP_SECRET,
          googleClientId: process.env.GOOGLE_CLIENT_ID.split(','),
          tiktokClientKey: process.env.TIKTOK_CLIENT_KEY,
          tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET,
          facebookScopes: ['id', 'name', 'first_name', 'last_name', 'email'],
        };
      },
    }),

    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        };
      },
    }),

    AwsModule.registerAsync({
      useFactory: () => {
        return {
          accessKeyId: process.env.AWS_SES_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SES_SECRET_KEY,
          region: process.env.AWS_SES_REGION,
          apiVersion: process.env.AWS_SES_API_VERSION,
          sesFrom: process.env.AWS_SES_FROM,
          appEnv: process.env.APP_ENV,
        };
      },
    }),
    MongooseModule.forFeature(mongooseModels),
  ],
  providers: providers,
  exports: [AuthService],
  controllers: controllers,
})
export class AuthModule { }
