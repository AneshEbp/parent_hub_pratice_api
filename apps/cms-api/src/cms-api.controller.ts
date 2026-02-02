import { Controller, Get } from '@nestjs/common';
import { CmsApiService } from './cms-api.service';

@Controller()
export class CmsApiController {
  constructor(private readonly cmsApiService: CmsApiService) {}

  @Get()
  getHello(): string {
    return this.cmsApiService.getHello();
  }
}
