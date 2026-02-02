import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class RequestPhoneLoginOTPInput
 * @typedef {RequestPhoneLoginOTPInput}
 */
@InputType()
export class RequestPhoneLoginOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  dialCode: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(14)
  number: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  @MinLength(5)
  deviceId: string;
}
