import { Module } from '@nestjs/common';
import { AgoraService } from './agora.service';
import { AgoraResolver } from './agora.resolver';
import { UsersModule } from '../users/users.module';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { FcmService } from 'libs/fcm';
import { PushNotificationTokenDataModule } from '@app/data-access/push-notification-token/push-notification-token.module';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';
import { VoipHelperService } from '@app/common/services/voip/agora/agora';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraModule
 * @typedef {AgoraModule}
 */
@Module({
  imports: [HttpModule, UsersModule, PushNotificationTokenDataModule],
  providers: [
    AgoraResolver,
    AgoraService,
    AgoraHelperService,
    FcmService,
    ConfigService,
    VoipHelperService,
  ],
  exports: [AgoraService],
})
export class AgoraModule {}
