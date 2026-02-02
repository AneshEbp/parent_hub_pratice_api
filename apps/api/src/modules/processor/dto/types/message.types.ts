import { ObjectType, Field, Float } from '@nestjs/graphql';



@ObjectType()
export class MessageResult {
  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  intent?: string;

  @Field(() => Float, { nullable: true })
  intent_confidence?: number;

  @Field({ nullable: true })
  sentiment?: string;

  @Field({ nullable: true })
  urgency?: string;

  @Field(() => [String], { nullable: true })
  entities?: string[];

  @Field({ nullable: true })
  create_task?: boolean;

  @Field(() => [String], { nullable: true })
  assign_to?: string[];

  @Field({ nullable: true })
  extracted_datetime?: string;

  @Field({ nullable: true })
  is_event?: boolean;

  @Field({ nullable: true })
  is_assistance_request?: boolean;

  @Field({ nullable: true })
  has_deadline?: boolean;

  @Field(() => [String], { nullable: true })
  action_items?: string[];

  @Field({ nullable: true })
  event_type?: string;
}
