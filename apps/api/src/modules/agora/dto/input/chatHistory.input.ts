import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChatHistoryInput {
  @Field()
  date: string; // YYYYMMDD

  @Field()
  targetUserId: string;
}
