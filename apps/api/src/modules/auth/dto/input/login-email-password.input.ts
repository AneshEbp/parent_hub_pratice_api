import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { RequestLoginOTPInput } from './reqest-login-otp.input';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class LoginEmailPasswordInput
 * @typedef {LoginEmailPasswordInput}
 * @extends {RequestLoginOTPInput}
 */
@InputType()
export class LoginEmailPasswordInput extends RequestLoginOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @IsNotEmpty()
  @Field()
  password: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  agent?: string;
}
