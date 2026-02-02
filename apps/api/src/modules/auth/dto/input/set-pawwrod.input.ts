import { Field, ArgsType } from '@nestjs/graphql';
import { Matches } from 'class-validator';
import { PASSWORD_REGEX_CHOICE_1 } from 'apps/api/src/constants';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class SetPasswordInput
 * @typedef {SetPasswordInput}
 */
@ArgsType()
export class SetPasswordInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @Matches(PASSWORD_REGEX_CHOICE_1.regex, {
    message: PASSWORD_REGEX_CHOICE_1.message,
  })
  password: string;
}
