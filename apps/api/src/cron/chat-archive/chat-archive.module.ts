import { Module } from '@nestjs/common';
import { ChatArchiveService } from './chat-archive.service';
import { AgoraModule } from '@api/modules/agora/agora.module';

@Module({
  imports: [AgoraModule],
  providers: [ChatArchiveService],
  exports: [ChatArchiveService],
})
export class ChatArchiveModule {}
