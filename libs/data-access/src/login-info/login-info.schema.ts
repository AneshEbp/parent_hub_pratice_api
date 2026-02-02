import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Document type for DeviceInfo, extending Mongoose's Document interface.
 */
export type LoginInfoDocument = LoginInfo & Document;

/**
 * Enum for defining the type of device.
 */
type DeviceType = 'android' | 'ios' | 'web';

/**
 * Schema representing device information for users.
 */
@Schema({ timestamps: true })
export class LoginInfo {
  /**
   * Description placeholder
   *
   * @type {string}
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    default: null,
    refPath: 'userModel', // This field tells Mongoose which model to reference dynamically
  })
  userId: string;

  /**
   * Description placeholder
   *
   * @type {string}
   */
  @Prop({
    type: String,
    required: true,
    enum: ['User', 'Admin'],
  })
  userModel: string; // Either 'User' or 'Admin'

  @Prop({ nullable: true })
  email: string;

  /**
   * The unique identifier of the device.
   *
   * @type {string}
   */
  @Prop()
  deviceId: string;

  @Prop()
  agent: string;

  @Prop()
  ip: string;

  @Prop({ default: null })
  loginTime: Date;

  @Prop({ default: null })
  logoutTime: Date;

  @Prop({ default: false })
  isSuccessful: boolean;

  @Prop()
  failureReason: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

/**
 * Mongoose schema for DeviceInfo, created from the DeviceInfo class.
 */
export const LoginInfoSchema = SchemaFactory.createForClass(LoginInfo);
