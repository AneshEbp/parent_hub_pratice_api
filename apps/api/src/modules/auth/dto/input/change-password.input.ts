import { Field, InputType } from '@nestjs/graphql';
import { Matches } from 'class-validator';
import { PASSWORD_REGEX_CHOICE_1 } from 'apps/api/src/constants';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ChangePasswordInput
 * @typedef {ChangePasswordInput}
 */
@InputType()
export class ChangePasswordInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  password: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @Matches(PASSWORD_REGEX_CHOICE_1.regex, {
    message: PASSWORD_REGEX_CHOICE_1.message,
  })
  new_password: string;
}
