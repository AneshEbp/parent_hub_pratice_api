import { IsNonDisposableEmail } from '@app/common/decorators/disposable-email.decorator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, MinLength } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class EmailSignupOTPInput
 * @typedef {EmailSignupOTPInput}
 */
@InputType()
export class EmailSignupOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  @IsNonDisposableEmail({ message: 'Lang.DISPOSABLE_EMAIL_NOT_ALLOWED' })
  // @Validate(IsValidEmailConstraint); -- in case of no custom decorator
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @MinLength(5)
  deviceId: string;
}
