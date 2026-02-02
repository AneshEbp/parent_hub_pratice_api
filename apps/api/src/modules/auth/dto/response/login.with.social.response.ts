import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
/**
 * ${1:Description placeholder}
 *
 * @class UserRespInSocialLogin
 * @typedef {UserRespInSocialLogin}
 * @extends {User}
 */
@ObjectType()
class UserRespInSocialLogin extends User {
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
 * @class SocialLoginResponse
 * @typedef {SocialLoginResponse}
 */
@ObjectType()
export class SocialLoginResponse {
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
   * @type {UserRespInSocialLogin}
   */
  @Field({ nullable: true })
  user: UserRespInSocialLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field()
  token: Token;
}
