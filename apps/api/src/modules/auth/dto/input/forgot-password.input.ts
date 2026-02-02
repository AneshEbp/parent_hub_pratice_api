import { InputType } from '@nestjs/graphql';
import { RequestLoginOTPInput } from './reqest-login-otp.input';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ForgotPasswordInput
 * @typedef {ForgotPasswordInput}
 * @extends {RequestLoginOTPInput}
 */
@InputType()
export class ForgotPasswordInput extends RequestLoginOTPInput {}
