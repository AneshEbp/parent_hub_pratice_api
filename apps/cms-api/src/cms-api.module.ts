import { Module } from '@nestjs/common';
import { CmsApiController } from './cms-api.controller';
import { CmsApiService } from './cms-api.service';

@Module({
  imports: [],
  controllers: [CmsApiController],
  providers: [CmsApiService],
})
export class CmsApiModule {}
