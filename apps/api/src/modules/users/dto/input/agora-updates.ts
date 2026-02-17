import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateAgoraUserInput {
  @Field()
  nickname: string;

  @Field()
  profileUrl: string;
}
