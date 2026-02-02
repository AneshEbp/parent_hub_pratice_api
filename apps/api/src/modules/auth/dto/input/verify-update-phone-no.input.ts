import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class VerifyUpdatedPhoneNumberInput
 * @typedef {VerifyUpdatedPhoneNumberInput}
 */
@InputType()
export class VerifyUpdatedPhoneNumberInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be 6 digit',
  })
  verificationCode: string;
}
