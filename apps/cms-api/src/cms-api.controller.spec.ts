import { Test, TestingModule } from '@nestjs/testing';
import { CmsApiController } from './cms-api.controller';
import { CmsApiService } from './cms-api.service';

describe('CmsApiController', () => {
  let cmsApiController: CmsApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CmsApiController],
      providers: [CmsApiService],
    }).compile();

    cmsApiController = app.get<CmsApiController>(CmsApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cmsApiController.getHello()).toBe('Hello World!');
    });
  });
});
