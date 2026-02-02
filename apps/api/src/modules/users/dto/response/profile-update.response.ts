import { Field, ObjectType } from '@nestjs/graphql';
import { UserResponse } from '@api/common/dto/user.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ProfileUpdateResponse
 * @typedef {ProfileUpdateResponse}
 */
@ObjectType()
export class ProfileUpdateResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  message: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {UserResponse}
   */
  @Field({ nullable: true })
  user: UserResponse;
}
