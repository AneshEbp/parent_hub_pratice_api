import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class RequestLoginOTPInput
 * @typedef {RequestLoginOTPInput}
 */
@InputType()
export class RequestLoginOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @MinLength(5)
  @IsNotEmpty()
  deviceId: string;
}
