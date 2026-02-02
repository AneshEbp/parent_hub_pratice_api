import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProcessorService } from './processor.service';
import { BatchResponse } from './dto/response/batch.response';

@Resolver()
export class ProcessorResolver {
    constructor(private readonly processorService: ProcessorService) { }
    @Mutation(() => BatchResponse)
    async processBatch(@Args('messages', { type: () => [String] }) messages: string[]): Promise<BatchResponse> {
        const results = await this.processorService.processBatch(messages);
        return {
            results,
            total: results.length
        }
    }

}
