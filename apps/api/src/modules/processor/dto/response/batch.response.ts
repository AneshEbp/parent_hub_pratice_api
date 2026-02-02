import { ObjectType, Field } from "@nestjs/graphql";
import { MessageResult } from "../types/message.types";

@ObjectType()
export class BatchResponse {
    @Field(() => [MessageResult], { nullable: true })
    results: MessageResult[];

    @Field({ nullable: true })
    total: number;
}