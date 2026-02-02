import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

/**
 * Represents the document type for `UserTokenMeta`
 *
 * @typedef {UserTokenMetaDocument}
 */
export type UserTokenMetaDocument = UserTokenMeta & mongoose.Document;

/**
 * Grant types available for tokens.
 * - 'all': Grants access to all APIs
 * - 'set_password': Token is valid only for setting passwords
 * - 'refresh_token': Token is used to refresh access tokens
 * - 'biometric_login': Token is used for biometric-based login
 *
 * @typedef {grant}
 */
type Grant = 'all' | 'set_password' | 'refresh_token' | 'biometric_login';

/**
 * Enum representing grant types.
 * It helps to manage token grants for different actions.
 */
export enum GrantType {
  ALL = 'all',
  SET_PASSWORD = 'set_password',
  REFRESH_TOKEN = 'refresh_token',
  BIOMETRIC_LOGIN = 'biometric_login',
}

/**
 * Authentication types for login methods.
 * These types indicate how the user authenticated, such as email, phone, or third-party providers.
 *
 * @typedef {authType}
 */
type authType =
  | 'email_password'
  | 'phone_otp'
  | 'email_otp'
  | 'facebook'
  | 'google'
  | 'apple'
  | 'tiktok'
  | 'biometric';

/**
 * Token types available.
 * Used to differentiate between access, refresh, and biometric tokens.
 *
 * @typedef {tokenType}
 */
type tokenType = 'access_token' | 'refresh_token' | 'biometric_token';

/**
 * Represents metadata related to a user's token.
 * Stores details of token type, authentication type, grant type, etc.
 */
@Schema({ timestamps: true })
export class UserTokenMeta {
  /**
   * Unique identifier for this token metadata.
   *
   * @type {string}
   */
  _id: string;

  /**
   * Reference to the user associated with this token.
   *
   * @type {string}
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  /**
   * Unique identifier for the device associated with the token.
   *
   * @type {string}
   */
  @Prop({ type: String })
  deviceId: string;

  /**
   * Type of token:
   * - 'access_token': Token used for API authorization
   * - 'refresh_token': Token used to renew the access token
   * - 'biometric_token': Token used for biometric authentication
   *
   * @type {string}
   */
  @Prop({ type: String, enum: ['access_token', 'refresh_token', 'biometric_token'] })
  tokenType: 'access_token' | 'refresh_token' | 'biometric_token';

  /**
   * Type of login method used for authentication:
   * - 'email_password': Login via email and password
   * - 'phone_otp': Login via OTP sent to phone
   * - 'email_otp': Login via OTP sent to email
   * - 'facebook', 'google', 'apple', 'tiktok': Third-party login
   * - 'biometric': Biometric login such as fingerprint or face ID
   *
   * @type {string}
   */
  @Prop({
    type: String,
    enum: [
      'email_password',
      'email_otp',
      'phone_otp',
      'facebook',
      'google',
      'apple',
      'tiktok',
      'biometric',
    ],
  })
  authType: authType;

  /**
   * Unique identifier for the token, used for validation and identification.
   *
   * @type {string}
   */
  @Prop({ required: true })
  jti: string;

  /**
   * Grant type for the token:
   * - 'all': Full access to all APIs
   * - 'set_password': Access limited to setting password
   * - 'refresh_token': Access limited to refreshing tokens
   * - 'biometric_login': Access limited to biometric login
   *
   * @type {string}
   */
  @Prop({ type: String, enum: ['all', 'set_password', 'refresh_token', 'biometric_login'] })
  grant: Grant;

  /**
   * Expiration date of the token.
   *
   * @type {Date}
   */
  @Prop({ type: Date })
  expiresAt: Date;

  /**
   * Timestamp when the token metadata was created.
   *
   * @type {Date}
   */
  createdAt: Date;

  /**
   * Timestamp when the token metadata was last updated.
   *
   * @type {Date}
   */
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

/**
 * Schema definition for `UserTokenMeta`.
 */
export const UserTokenMetaSchema = SchemaFactory.createForClass(UserTokenMeta);
