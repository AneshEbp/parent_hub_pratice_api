import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type UpdatePhoneNumberDocument = UpdatePhoneNumber & mongoose.Document;

export enum PhoneContactType {
  mobile = 'mobile',
  landline = 'landline',
}

@Schema({ timestamps: true })
export class UpdatePhoneNumber {
  @Prop({ required: true, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  dialCode: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, default: PhoneContactType.mobile })
  phoneType: PhoneContactType;

  @Prop({ required: true })
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

export const UpdatePhoneNumberSchema = SchemaFactory.createForClass(UpdatePhoneNumber);
