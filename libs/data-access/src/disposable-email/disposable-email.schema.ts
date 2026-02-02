import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type DisposableEmailDocument = DisposableEmail & mongoose.Document;

@Schema({ timestamps: true })
export class DisposableEmail {
  @Prop({ required: true })
  domain: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const DisposableEmailSchema = SchemaFactory.createForClass(DisposableEmail);
