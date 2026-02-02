import { ObjectType, Field } from '@nestjs/graphql';
import { Token } from '../../../../common/dto/token';
import { UserResponse } from '../../../../common/dto/user.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserWithToken
 * @typedef {UserWithToken}
 */
@ObjectType()
export class UserWithToken {
  /**
   * ${1:Description placeholder}
   *
   * @type {UserResponse}
   */
  @Field()
  user: UserResponse;

  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
