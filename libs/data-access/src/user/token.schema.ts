import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type EmailTokenDocument = EmailToken & mongoose.Document;

@Schema({ timestamps: true })
export class EmailToken {
  @Prop({ required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ default: 'resetToken' })
  type: string;

  @Prop({ required: true, default: Date.now() + 3600 })
  expiresIn: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const EmailTokenSchema = SchemaFactory.createForClass(EmailToken);
