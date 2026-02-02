import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
/**
 * ${1:Description placeholder}
 *
 * @class UserRespInGoogleLogin
 * @typedef {UserRespInGoogleLogin}
 * @extends {User}
 */
@ObjectType()
class UserRespInGoogleLogin extends User {
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
 * @class LoginWithGoogleResponse
 * @typedef {LoginWithGoogleResponse}
 */
@ObjectType()
export class LoginWithGoogleResponse {
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
   * @type {UserRespInGoogleLogin}
   */
  @Field({ nullable: true })
  user: UserRespInGoogleLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
