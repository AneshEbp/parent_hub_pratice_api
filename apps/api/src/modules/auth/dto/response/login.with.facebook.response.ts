import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
/**
 * ${1:Description placeholder}
 *
 * @class UserRespInFacebookLogin
 * @typedef {UserRespInFacebookLogin}
 * @extends {User}
 */
@ObjectType()
class UserRespInFacebookLogin extends User {
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
 * @class LoginWithFacebookResponse
 * @typedef {LoginWithFacebookResponse}
 */
@ObjectType()
export class LoginWithFacebookResponse {
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
   * @type {UserRespInFacebookLogin}
   */
  @Field({ nullable: true })
  user: UserRespInFacebookLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
