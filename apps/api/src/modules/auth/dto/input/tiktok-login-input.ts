import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class TiktokLoginInput
 * @typedef {TiktokLoginInput}
 */
@ArgsType()
export class TiktokLoginInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  code: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  deviceId: string;
}
