import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Document type for DeviceInfo, extending Mongoose's Document interface.
 */
export type DeviceInfoDocument = DeviceInfo & Document;

/**
 * Enum for defining the type of device.
 */
type DeviceType = 'android' | 'ios' | 'web';

/**
 * Schema representing device information for users.
 */
@Schema({ timestamps: true })
export class DeviceInfo {
  /**
   * The unique identifier of the user associated with this device.
   *
   * @type {MongooseSchema.Types.ObjectId}
   * @required
   */
  @Prop({ required: true })
  userId: MongooseSchema.Types.ObjectId;

  /**
   * The unique identifier of the device.
   *
   * @type {string}
   */
  @Prop()
  deviceId: string;

  /**
   * The type of device (e.g., android, ios, web).
   *
   * @type {DeviceType}
   * @enum {DeviceType}
   */
  @Prop({ type: String, enum: ['android', 'ios', 'web'] })
  deviceType: DeviceType;

  /**
   * The name of the device, which may provide additional context about the device.
   *
   * @type {string}
   */
  @Prop()
  deviceName: string;

  /**
   * The unique token associated with the device, used for push notifications or similar purposes.
   *
   * @type {string}
   */
  @Prop()
  deviceToken: string;

  /**
   * The date when the device was verified, indicating when the user confirmed this device.
   *
   * @type {Date}
   */
  @Prop()
  verifiedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

/**
 * Mongoose schema for DeviceInfo, created from the DeviceInfo class.
 */
export const DeviceInfoSchema = SchemaFactory.createForClass(DeviceInfo);
