import { Module } from '@nestjs/common';
import { ProcessorResolver } from './processor.resolver';
import { ProcessorService } from './processor.service';
import { EmbedderService } from '@app/common/services/processor/embedder.service';
import { IntentDetectionService } from '@app/common/services/processor/detect-intent.service';

@Module({
  providers: [ProcessorResolver, ProcessorService, EmbedderService, IntentDetectionService]
})
export class ProcessorModule { }
