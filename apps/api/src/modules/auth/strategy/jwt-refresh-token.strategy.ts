import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTokenMeta, UserTokenMetaDocument } from '@app/data-access';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class JwtRefreshTokenStrategy
 * @typedef {JwtRefreshTokenStrategy}
 * @extends {PassportStrategy(Strategy, 'jwt')}
 */
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Creates an instance of JwtRefreshTokenStrategy.
   *
   * @constructor
   * @param {Model<UserTokenMetaDocument>} userTokenMetaModel
   */
  constructor(
    @InjectModel(UserTokenMeta.name)
    private readonly userTokenMetaModel: Model<UserTokenMetaDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }
  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {*} payload
   * @returns {Promise<any>}
   */
  async validate(payload) {
    const loginMeta = await this.userTokenMetaModel
      .findOne(
        {
          userId: payload.sub,
          jti: payload.jti,
          tokenType: 'refresh_token',
        },
        { jti: 1, userId: 1, tokenType: 1, grant: 1 },
      )
      .exec(); // Ensure it's a Promise

    if (!loginMeta) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return loginMeta;
  }
}
