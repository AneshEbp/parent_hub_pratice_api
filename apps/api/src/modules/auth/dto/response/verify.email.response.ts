import { ObjectType } from '@nestjs/graphql';
import { LoginWithEmailResponse } from './login.with.email.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class VerifyEmailResponse
 * @typedef {VerifyEmailResponse}
 * @extends {LoginWithEmailResponse}
 */
@ObjectType()
export class VerifyEmailResponse extends LoginWithEmailResponse {}
