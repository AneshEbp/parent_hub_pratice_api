import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class FacebookLoginInput
 * @typedef {FacebookLoginInput}
 */
@ArgsType()
export class FacebookLoginInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  accessToken: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  deviceId: string;
}
