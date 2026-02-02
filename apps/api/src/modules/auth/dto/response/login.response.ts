import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
/**
 * ${1:Description placeholder}
 *
 * @class UserRespInLogin
 * @typedef {UserRespInLogin}
 * @extends {User}
 */
@ObjectType()
class UserRespInLogin extends User {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  loginType: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  cometAuthToken?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class LoginResponse
 * @typedef {LoginResponse}
 */
@ObjectType()
export class LoginResponse {
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
   * @type {UserRespInLogin}
   */
  @Field({ nullable: true })
  user: UserRespInLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
