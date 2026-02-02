import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Represents the document type for `PushNotificationToken`.
 *
 * @typedef {PushNotificationTokenDocument}
 */
export type PushNotificationTokenDocument = PushNotificationToken & Document;

/**
 * Device types supported for push notifications.
 * - 'android': Push notification is sent to Android devices
 * - 'ios': Push notification is sent to iOS devices
 *
 * @typedef {deviceType}
 */
type DeviceType = 'android' | 'ios';

/**
 * Push notification token schema that stores tokens for devices,
 * used to send notifications to specific users and devices.
 */
@Schema({ timestamps: true })
export class PushNotificationToken {
  /**
   * Reference to the user associated with the push notification token.
   *
   * @type {MongooseSchema.Types.ObjectId}
   */
  @Prop({ required: true, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  /**
   * Unique identifier for the device receiving the push notification.
   *
   * @type {string}
   */
  @Prop()
  deviceId: string;

  /**
   * Type of device (Android or iOS) that the token is associated with.
   *
   * @type {deviceType}
   */
  @Prop({ type: String, enum: ['android', 'ios'] })
  deviceType: DeviceType;

  /**
   * Push token used for sending push notifications (e.g., Firebase Cloud Messaging (FCM) token).
   *
   * @type {string}
   */
  @Prop()
  pushToken: string;

  /**
   * VOIP token, used specifically for initiating calls on iOS devices.
   * This is required for enabling voice over IP (VoIP) push notifications.
   *
   * @type {string}
   */
  @Prop()
  voipToken: string; // only for iOS for initiating call

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

/**
 * Schema definition for `PushNotificationToken`.
 */
export const PushNotificationTokenSchema = SchemaFactory.createForClass(PushNotificationToken);
