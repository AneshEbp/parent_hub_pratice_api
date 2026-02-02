import {
  UserSchema,
  User,
  EmailTemplate,
  EmailTemplateSchema,
  DisposableEmail,
  DisposableEmailSchema,
  LoginInfo,
  LoginInfoSchema,
  UpdatePhoneNumber,
  UpdatePhoneNumberSchema,
  PushNotificationToken,
  PushNotificationTokenSchema,
  OTPRequestSchema,
  OTPRequest,
  UserTokenMetaSchema,
  UserTokenMeta,
  DeviceInfo,
  DeviceInfoSchema,
} from '@app/data-access';
/**
 * ${1:Description placeholder}
 *
 * @type {{ name: any; schema: any; }[]\}
 */
export const mongooseModels = [
  { name: DeviceInfo.name, schema: DeviceInfoSchema },
  { name: PushNotificationToken.name, schema: PushNotificationTokenSchema },
  { name: User.name, schema: UserSchema },
  { name: OTPRequest.name, schema: OTPRequestSchema },
  { name: UserTokenMeta.name, schema: UserTokenMetaSchema },
  { name: UpdatePhoneNumber.name, schema: UpdatePhoneNumberSchema },
  { name: EmailTemplate.name, schema: EmailTemplateSchema },
  { name: DisposableEmail.name, schema: DisposableEmailSchema },
  { name: LoginInfo.name, schema: LoginInfoSchema },
];
