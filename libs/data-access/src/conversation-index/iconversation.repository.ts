import { Injectable } from '@nestjs/common';
import { BaseRepo } from '../repository/base.repo';
import {
  ConversationIndex,
  ConversationIndexDocument,
} from './iconversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class IConversationRepository extends BaseRepo<ConversationIndexDocument> {
  constructor(
    @InjectModel(ConversationIndex.name)
    private readonly IConversationModel: Model<ConversationIndexDocument>,
  ) {
    super(IConversationModel);
  }

  /**
   * Updates multiple conversation pointers in one DB trip
   */
  async bulkUpsert(conversationIds: string[], fileName: string, date: Date) {
    if (conversationIds.length === 0) return;

    const ops = conversationIds.map((id) => ({
      updateOne: {
        filter: { conversationId: id, fileName: fileName },
        update: { $set: { date: date } },
        upsert: true,
      },
    }));

    return this.IConversationModel.bulkWrite(ops);
  }

  /**
   * Finds the exact files needed for a specific chat
   */
  async findFilesForChat(conversationId: string) {
    return this.IConversationModel.find({ conversationId })
      .sort({ date: -1 })
      .select('fileName date')
      .lean();
  }
}
