import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class LoginWithOTPInput
 * @typedef {LoginWithOTPInput}
 */
@InputType()
export class LoginWithOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  email: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  verificationCode: string;
}
