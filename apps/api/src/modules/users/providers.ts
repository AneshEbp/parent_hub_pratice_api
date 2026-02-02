import {
  DeviceInfoRepository,
  OTPRequestRepository,
  PushNotificationTokenRepository,
  TokenRepository,
  UserTokenMetaRepository,
  UsersRepository,

} from '@app/data-access';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { S3Service } from '@app/common/services/s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';
import { PageRepository } from '@app/data-access/page';
import { FcmService } from 'libs/fcm';
/**
 * ${1:Description placeholder}
 *
 * @type {any[]}
 */
export const providers = [
  UsersResolver,
  UsersService,
  S3Service,
  AgoraHelperService,
  FcmService,
  ConfigService,
  UsersRepository,
  TokenRepository,
  OTPRequestRepository,
  UserTokenMetaRepository,
  DeviceInfoRepository,
  PushNotificationTokenRepository,
  PageRepository,
];
