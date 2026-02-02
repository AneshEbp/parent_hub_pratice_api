import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type EmailTemplateDocument = EmailTemplate & mongoose.Document;

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  slug: string;
  @Prop({ required: true })
  subject: string;
  // @Prop({ required: true, enum: [Status.ACTIVE, Status.INACTIVE] })
  // status: string;
  @Prop({ required: true })
  body: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ required: true, enum: [Status.ACTIVE, Status.INACTIVE] })
  status: string;

  @Prop({ default: false })
  forBusiness: false;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop({ nullable: true })
  description: string;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
