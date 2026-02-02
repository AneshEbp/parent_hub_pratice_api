import { UserProfileResponse } from '@api/common/dto/user.response';
import { BaseResponse } from '@app/common/dto/response/base-response.dto';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserDetailsResponse
 * @typedef {UserDetailsResponse}
 * @extends {UserProfileResponse}
 */
@ObjectType()
export class UserDetailsResponse extends UserProfileResponse {
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
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserProfilesListResponse
 * @typedef {UserProfilesListResponse}
 * @extends {BaseResponse}
 */
@ObjectType()
export class UserProfilesListResponse extends BaseResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {?UserDetailsResponse[]}
   */
  @Field(() => [UserDetailsResponse], { nullable: true })
  users?: UserDetailsResponse[];
}
