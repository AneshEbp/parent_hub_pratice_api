import { ObjectType, Field } from '@nestjs/graphql';
import { LoginFlowType } from '@app/common/enum/login-flow-type.enum';
import { UserStatus } from '@app/common/enum/user-status.enum';
// import { CurrentSubscription } from '@api/modules/subscription/entities/current-subscription.entity';
import { AddressResponse } from '@app/common/dto/response/address.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserProfileResponse
 * @typedef {UserProfileResponse}
 */
@ObjectType()
export class UserProfileResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  _id: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  firstName?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  lastName?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  profileImage?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field(() => [String], { nullable: true })
  profileImageThumbnails?: string[];
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserResponse
 * @typedef {UserResponse}
 * @extends {UserProfileResponse}
 */
@ObjectType()
export class UserResponse extends UserProfileResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  authProvider: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  authProviderId: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {UserStatus}
   */
  @Field(() => UserStatus, { nullable: true })
  status: UserStatus;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  bio?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?AddressResponse}
   */
  @Field({ nullable: true })
  address?: AddressResponse;
  /**
   * ${1:Description placeholder}
   *
   * @type {?LoginFlowType}
   */
  @Field(() => LoginFlowType, { nullable: true })
  loginFlowType?: LoginFlowType;
  /**
   * ${1:Description placeholder}
   *
   * @type {?boolean}
   */
  @Field({ nullable: true })
  isBiometricEnabled?: boolean;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  acceptedTermsVersion: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {boolean}
   */
  @Field({ nullable: true })
  isTermsVersionSynced: boolean;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field(() => [String], { nullable: true })
  profileImageThumbnails?: string[];
}
