import { IntentConfig } from '@app/common/config/intent.config';
import { IntentHelper } from '@app/common/helpers/general_info.helper';
import { IntentDetectionService } from '@app/common/services/processor/detect-intent.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessageResult } from './dto/types/message.types';

@Injectable()
export class ProcessorService implements OnModuleInit {
    // Helper instance
    private helper: IntentHelper;

    // Will hold embeddings for all prototypes
    private intentEmbeddings: Record<string, number[][]> = {};

    constructor(
        private readonly intentDetectionService: IntentDetectionService,
    ) {
        this.helper = new IntentHelper();
    }

    // Lifecycle hook called once after module init
    async onModuleInit() {
        // Initialize embeddings in IntentDetectionService
        await this.intentDetectionService.onModuleInit();
    }

    async process(text: string): Promise<MessageResult> {
        // 1️⃣ Detect intent and confidence
        const [intent, confidence] =
            await this.intentDetectionService.detectIntent(text);
        console.log(intent, confidence)
        // 2️⃣ Sentiment
        const sentiment = this.helper.detectSentiment(text);

        // 3️⃣ Event detection
        const [is_event, event_type] = this.helper.isEvent(text);

        // 4️⃣ Assistance request detection
        const is_assistance = this.helper.isAssistanceRequest(text);

        // 5️⃣ Deadline check
        const [has_deadline_flag, action_items] = this.helper.hasDeadline(text);

        // 6️⃣ Compute urgency
        let [urgency, _] = this.helper.computeUrgency(text, intent);

        // Adjust urgency for certain conditions
        if (
            (is_assistance || (is_event && has_deadline_flag)) &&
            urgency === 'LOW'
        ) {
            urgency = 'MEDIUM';
        }

        // 7️⃣ Determine if task should be created
        const create_task =
            (intent !== 'GENERAL_INFO' ||
                is_event ||
                is_assistance ||
                has_deadline_flag) &&
            confidence >= 0.35;

        // 8️⃣ Assign to based on rules
        const assignees = IntentConfig.ASSIGNMENT_RULES[intent] || [];

        // 9️⃣ Extract entities & datetime
        const entities = this.helper.extractEntities(text);
        const extracted_datetime = this.helper.extractDateTime(text);

        // 10️⃣ Return structured result
        return {
            text,
            intent,
            intent_confidence: confidence,
            sentiment,
            urgency,
            entities,
            create_task,
            assign_to: assignees,
            extracted_datetime,
            is_event,
            is_assistance_request: is_assistance,
            has_deadline: has_deadline_flag,
            action_items,
            event_type,
        };
    }

    async processBatch(messages: string[]): Promise<MessageResult[]> {
        // Map over all messages and process each asynchronously
        const results: MessageResult[] = [];
        for (const msg of messages) {
            const result = await this.process(msg);
            results.push(result);
        }
        return results;
    }
}
