import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AppleLoginInput
 * @typedef {AppleLoginInput}
 */
@ArgsType()
export class AppleLoginInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  idToken: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  deviceId: string;
}
