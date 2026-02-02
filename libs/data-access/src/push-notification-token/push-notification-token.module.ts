import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushNotificationTokenRepository } from './push-notification-token.repository';
import {
  PushNotificationToken,
  PushNotificationTokenSchema,
} from './push-notification-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushNotificationToken.name, schema: PushNotificationTokenSchema },
    ]),
  ],
  providers: [PushNotificationTokenRepository],
  exports: [PushNotificationTokenRepository, MongooseModule],
})
export class PushNotificationTokenDataModule {}
