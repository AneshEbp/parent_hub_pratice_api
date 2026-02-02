import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
