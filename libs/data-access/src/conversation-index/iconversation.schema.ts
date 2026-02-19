import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationIndexDocument = ConversationIndex & Document;

@Schema({ timestamps: true })
export class ConversationIndex {
  @Prop({ required: true, index: true })
  conversationId: string; // "userA_userB" or "group_123"

  @Prop({ required: true })
  date: Date; // The date of the archive

  @Prop({ required: true })
  fileName: string; // e.g., "2026-02-19.ndjson"
}

export const ConversationIndexSchema = SchemaFactory.createForClass(ConversationIndex);

// Important: Prevents duplicate entries for the same conversation in the same file
ConversationIndexSchema.index({ conversationId: 1, fileName: 1 }, { unique: true });