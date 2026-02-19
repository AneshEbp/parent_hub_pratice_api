import { AgoraService } from '@api/modules/agora/agora.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ChatArchiveService {
  constructor(private readonly agoraService: AgoraService) {}

  @Cron('0 3 * * *', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    console.log('Starting daily chat archive...');
    await this.agoraService.archiveChatHistory();
    console.log('Daily chat archive completed.');
  }
}
