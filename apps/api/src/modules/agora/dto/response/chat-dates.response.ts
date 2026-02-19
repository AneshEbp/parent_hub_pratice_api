import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class ChatFileItem {
  @Field(() => String)
  name: string;

  @Field(() => String)
  date: string;
}

@ObjectType()
export class ChatFileMapResponse {
  @Field(() => String)
  conversationId: string;

  @Field(() => Int)
  totalDaysActive: number;

  @Field(() => [ChatFileItem])
  files: ChatFileItem[];
}