import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserTokenMeta, UserTokenMetaDocument } from '@app/data-access';
import { I18nService } from 'nestjs-i18n';
import { toMongoId } from '@app/common/helpers/mongo-helper';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class JwtStrategy
 * @typedef {JwtStrategy}
 * @extends {PassportStrategy(Strategy, 'jwt')}
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Creates an instance of JwtStrategy.
   *
   * @constructor
   * @param {Model<UserTokenMetaDocument>} userTokenMetaModel
   * @param {Model<UserDocument>} userModel
   */
  constructor(
    @InjectModel(UserTokenMeta.name)
    private readonly userTokenMetaModel: Model<UserTokenMetaDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly i18nService: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
  async validate(payload, request: any) {
    console.log('payload', payload);

    const [loginMeta, loginMetaGoogle] = await Promise.all([
      this.userTokenMetaModel
        .findOne(
          {
            userId: toMongoId(payload.sub),
            jti: payload.jti,
            tokenType: 'access_token',
          },
          { jti: 1, userId: 1, tokenType: 1, grant: 1 },
        )
        .exec(),

      this.userTokenMetaModel
        .findOne(
          {
            userId: toMongoId(payload.sub),
            jti: payload.jti,
            authType: 'google',
          },
          { jti: 1, userId: 1, tokenType: 1, grant: 1 },
        )
        .exec(),
    ]);

    if (!loginMeta && !loginMetaGoogle) {
      throw new HttpException(this.i18nService.t('auth.unauthorized'), HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userModel
      .findOne(
        { _id: toMongoId(payload.sub) },
        { isTermsVersionSynced: 1, roles: 1, businessId: 1 },
      )
      .exec();

    request.user = user;

    const validLoginMeta = loginMeta || loginMetaGoogle;

    return {
      ...validLoginMeta.toObject(),
      isTermsVersionSynced: user.isTermsVersionSynced,
      roles: user.roles,
      businessId: user.businessId,
    };
  }
}
