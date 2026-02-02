import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UpdatePhoneNumberInput
 * @typedef {UpdatePhoneNumberInput}
 */
@InputType()
export class UpdatePhoneNumberInput {
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
  @Matches(/^\d{8,14}$/, {
    message: 'number must contain 8-14 digit',
  })
  number: string;
}
