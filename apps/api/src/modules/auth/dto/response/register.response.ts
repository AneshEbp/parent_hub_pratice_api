import { ObjectType, Field } from '@nestjs/graphql';
import { UserRespInEmailLogin } from './login.with.email.response';
import { OTPResponse } from './otp.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class RegisterResponse
 * @typedef {RegisterResponse}
 * @extends {OTPResponse}
 */
@ObjectType()
export class RegisterResponse extends OTPResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {UserRespInEmailLogin}
   */
  @Field({ nullable: true })
  user: UserRespInEmailLogin;
}
