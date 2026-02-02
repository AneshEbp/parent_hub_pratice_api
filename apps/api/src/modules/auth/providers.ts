import {
  DeviceInfoRepository,
  UsersRepository,
  OTPRequestRepository,
  UserTokenMetaRepository,
  UpdatePhoneNumberRepository,
  PushNotificationTokenRepository,
  EmailTemplateRepository,
  DisposableEmailRepository,
  LoginInfoRepository,
} from '@app/data-access';
import { JwtTokenService } from '@app/authentication';

/**
 * Resolvers
 */
import { AuthResolver } from './auth.resolver';

/**
 * Services
 */
import { AuthService } from './services/auth.service';

/**
 * Strategy
 */
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { IsValidEmailConstraint } from '@app/common/decorators/disposable-email.decorator';

import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';
// import { AwsSNSService } from '@app/common/services/sns';

/**
 * ${1:Description placeholder}
 *Wx`
 * @type {any[]}
 */
export const providers = [
  /**
   * Import resolvers
   */
  AuthResolver,

  /***
   * Import services
   */
  AuthService,
  // AwsSNSService,
  JwtTokenService,
  JwtStrategy,
  // S3Service,
  ConfigService,

  IsValidEmailConstraint,
  // CometChatHelperService,
  AgoraHelperService,
  /**
   * Import repo
   */
  DeviceInfoRepository,
  PushNotificationTokenRepository,
  OTPRequestRepository,
  UsersRepository,
  UserTokenMetaRepository,
  UpdatePhoneNumberRepository,
  EmailTemplateRepository,
  DisposableEmailRepository,
  LoginInfoRepository,
];
