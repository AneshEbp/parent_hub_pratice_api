import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class VerifyResetPasswordOtpInput
 * @typedef {VerifyResetPasswordOtpInput}
 */
@InputType()
export class VerifyResetPasswordOtpInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  verificationCode: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  email: string;
}
