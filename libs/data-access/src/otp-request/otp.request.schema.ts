import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RequestedFor } from '@app/common/enum/otp-request.enum';
import { Document } from 'mongoose';

export type OTPRequestDocument = OTPRequest & Document;
/**
 * This schema holds user afer sent otp request is made to server and otp is not verified yet
 */

@Schema({ timestamps: true })
export class OTPRequest {
  /**
   * Id of the device requesting otp
   */
  @Prop({ required: true })
  deviceId: string;
  /**
   * email for user
   */
  @Prop({ required: false })
  email: string;
  /**
   * phone number for user
   */
  @Prop({ required: false })
  phoneNumber: string;
  /**
   * Otp requested
   */
  @Prop({ required: true, enum: RequestedFor })
  requestedFor: string;

  @Prop({ required: true, index: true })
  verificationCode: string;

  @Prop({ default: null })
  expiresAt: Date;

  @Prop({ default: 0 })
  expiresBy: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const OTPRequestSchema = SchemaFactory.createForClass(OTPRequest);
