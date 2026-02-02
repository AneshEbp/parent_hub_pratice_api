import { ObjectType, Field } from '@nestjs/graphql';
import { Token } from '../../../../common/dto/token';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class BiometricLoginResponse
 * @typedef {BiometricLoginResponse}
 * @extends {Token}
 */
@ObjectType()
export class BiometricLoginResponse extends Token {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  message?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  biometricToken: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {Date}
   */
  @Field({ nullable: true })
  biometricTokenExpiresIn: Date;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  cometAuthToken?: string;
}
