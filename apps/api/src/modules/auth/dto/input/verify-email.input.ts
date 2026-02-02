import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class VerifyEmailInput
 * @typedef {VerifyEmailInput}
 */
@InputType()
export class VerifyEmailInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsOptional()
  verificationCode: string;
}
