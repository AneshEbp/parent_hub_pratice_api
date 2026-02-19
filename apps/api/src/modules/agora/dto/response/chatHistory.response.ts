import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class ChatMessage {
  @Field()
  id: string;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field()
  body: string;

  @Field()
  type: string;

  @Field(() => Float)
  time: number;
}

@ObjectType()
export class ChatHistoryResponse {
  @Field(() => [ChatMessage])
  messages: ChatMessage[];
}
