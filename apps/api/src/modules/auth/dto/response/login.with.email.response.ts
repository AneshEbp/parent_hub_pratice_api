import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.response';
import { Token } from '../../../../common/dto/token';
import { UserStatus } from '@app/common/enum/user-status.enum';
import { LoginFlowType } from '@app/common/enum/login-flow-type.enum';
import { VerificationCodeExpiry } from './verification.code.expiry';
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UserRespInEmailLogin
 * @typedef {UserRespInEmailLogin}
 * @extends {User}
 */
@ObjectType()
export class UserRespInEmailLogin extends User {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  loginType?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {LoginFlowType}
   */
  @Field(() => LoginFlowType, { nullable: true })
  loginFlowType: LoginFlowType;

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
  cometAuthToken?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class LoginWithEmailResponse
 * @typedef {LoginWithEmailResponse}
 */
@ObjectType()
export class LoginWithEmailResponse {
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
   * @type {UserRespInEmailLogin}
   */
  @Field({ nullable: true })
  user: UserRespInEmailLogin;
  /**
   * ${1:Description placeholder}
   *
   * @type {Token}
   */
  @Field({ nullable: true })
  token: Token;
  /**
   * ${1:Description placeholder}
   *
   * @type {?VerificationCodeExpiry}
   */
  @Field({ nullable: true })
  expiry?: VerificationCodeExpiry;
}
