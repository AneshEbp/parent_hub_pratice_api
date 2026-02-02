import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
/**
 * ${1:Description placeholder}
 *
 * @class UserRespInAppleLogin
 * @typedef {UserRespInAppleLogin}
 * @extends {User}
 */
@ObjectType()
class UserRespInAppleLogin extends User {
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
 * @class LoginWithAppleResponse
 * @typedef {LoginWithAppleResponse}
 */
@ObjectType()
export class LoginWithAppleResponse {
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
   * @type {UserRespInAppleLogin}
   */
  @Field({ nullable: true })
  user: UserRespInAppleLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
