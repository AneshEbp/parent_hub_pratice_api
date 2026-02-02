import {
  UserSchema,
  User,
  EmailToken,
  EmailTokenSchema,
  DeviceInfo,
  DeviceInfoSchema,
  OTPRequest,
  OTPRequestSchema,
  UserTokenMeta,
  UserTokenMetaSchema,
  PushNotificationTokenSchema,
  PushNotificationToken,
} from '@app/data-access';
import { Page, PageSchema } from '@app/data-access/page';

/**
 * ${1:Description placeholder}
 *
 * @type {{ name: any; schema: any; }[]\}
 */
export const mongooseModels = [
  { name: User.name, schema: UserSchema },
  {
    name: EmailToken.name,
    schema: EmailTokenSchema,
  },
  {
    name: DeviceInfo.name,
    schema: DeviceInfoSchema,
  },
  {
    name: OTPRequest.name,
    schema: OTPRequestSchema,
  },
  {
    name: UserTokenMeta.name,
    schema: UserTokenMetaSchema,
  },
  {
    name: PushNotificationToken.name,
    schema: PushNotificationTokenSchema,
  },
  {
    name: Page.name,
    schema: PageSchema,
  },
];
