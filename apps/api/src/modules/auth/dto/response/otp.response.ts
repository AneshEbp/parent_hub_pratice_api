import { ObjectType, Field } from '@nestjs/graphql';
import { VerificationCodeExpiry } from './verification.code.expiry';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class OTPResponse
 * @typedef {OTPResponse}
 */
@ObjectType()
export class OTPResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  message: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {VerificationCodeExpiry}
   */
  @Field({ nullable: true })
  expiry: VerificationCodeExpiry;
}
