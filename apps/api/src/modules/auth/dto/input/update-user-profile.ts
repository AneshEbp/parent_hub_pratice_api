import { Field, InputType } from '@nestjs/graphql';
import { AddressInput } from './common/address.input';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UpdateUserProfile
 * @typedef {UpdateUserProfile}
 */
@InputType()
export class UpdateUserProfile {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  firstName: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  lastName: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  bio: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {AddressInput}
   */
  @Field({ nullable: true })
  address: AddressInput;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  profileImage: string;
}
