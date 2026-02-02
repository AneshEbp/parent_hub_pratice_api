import { ObjectType, Field } from '@nestjs/graphql';
/**
 * ${1:Description placeholder}
 *
 * @class ForgotPasswordVerificationExpiry
 * @typedef {ForgotPasswordVerificationExpiry}
 */
@ObjectType()
class ForgotPasswordVerificationExpiry {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field()
  expiresBy: number;
  /**
   * ${1:Description placeholder}
   *
   * @type {Date}
   */
  @Field()
  expiresAt: Date;
}
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ForgotPasswordResponse
 * @typedef {ForgotPasswordResponse}
 */
@ObjectType()
export class ForgotPasswordResponse {
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
   * @type {ForgotPasswordVerificationExpiry}
   */
  @Field({ nullable: true })
  expiry: ForgotPasswordVerificationExpiry;
}
