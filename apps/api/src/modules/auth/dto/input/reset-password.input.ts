import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ResetPasswordInput
 * @typedef {ResetPasswordInput}
 */
@InputType()
export class ResetPasswordInput {
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
  @MinLength(5)
  password: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @IsNotEmpty()
  @Field()
  verificationCode: string;
}
