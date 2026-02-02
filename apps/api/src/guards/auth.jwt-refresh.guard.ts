import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class JwtRefreshGuard
 * @typedef {JwtRefreshGuard}
 * @extends {AuthGuard('jwt-refresh-token')}
 */
@Injectable()
export default class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}
