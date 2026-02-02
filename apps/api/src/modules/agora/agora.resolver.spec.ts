import { Test, TestingModule } from '@nestjs/testing';
import { AgoraResolver } from './agora.resolver';
import { AgoraService } from './agora.service';

describe('AgoraResolver', () => {
  let resolver: AgoraResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgoraResolver, AgoraService],
    }).compile();

    resolver = module.get<AgoraResolver>(AgoraResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
