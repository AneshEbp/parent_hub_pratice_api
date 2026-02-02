import { registerEnumType } from '@nestjs/graphql';

export enum RequestedFor {
  app_login = 'app-login',
  cms_login = 'cms-login',
  cms_forgot_password = 'cms-forgot-password',
  update_email = 'update-email',
  forgot_password = 'forgot-password',
  forgot_password_otp = 'forgot-password-otp',

  app_user_create_otp = 'app-user-create-otp',
  verify_email_set_password = 'verify-email-and-set-password',
  reset_password = 'reset-password',
}

registerEnumType(RequestedFor, {
  name: 'RequestedFor',
});
