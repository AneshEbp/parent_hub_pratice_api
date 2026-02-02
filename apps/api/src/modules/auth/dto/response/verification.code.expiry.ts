import { ObjectType, Field } from '@nestjs/graphql';
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class VerificationCodeExpiry
 * @typedef {VerificationCodeExpiry}
 */
@ObjectType()
export class VerificationCodeExpiry {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field({ nullable: true })
  expiresBy: number;
  /**
   * ${1:Description placeholder}
   *
   * @type {Date}
   */
  @Field()
  expiresAt: Date;
}
