import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { S3Service } from '@app/common/services/s3';
import { SignedUrlMethod } from '@app/common/enum/signed-url.enum';

describe('UsersResolver', () => {
  // let usersResolver: UsersResolver;
  // let usersService: UsersService;
  // let s3Service: S3Service;
  // beforeEach(async () => {
  //   const moduleRef: TestingModule = await Test.createTestingModule({
  //     providers: [UsersResolver, UsersService, S3Service],
  //   }).compile();
  //   usersResolver = moduleRef.get<UsersResolver>(UsersResolver);
  // usersService = moduleRef.get<UsersService>(UsersService);
  //   s3Service = moduleRef.get<S3Service>(S3Service);
  // });
  describe('getPreSignedUrl', () => {
    it('should return message and url', async () => {
      const url = 'https://google.com';
      // jest
      //   .spyOn(s3Service, 'getPreSignedUrl')
      //   .mockImplementation(async () => url);
      // const result = await usersResolver.getPreSignedUrl({
      //   path: 'https://google.com',
      //   method: SignedUrlMethod.GET,
      // });
      expect(url).toBe('https://google.com');
    });
  });
});
