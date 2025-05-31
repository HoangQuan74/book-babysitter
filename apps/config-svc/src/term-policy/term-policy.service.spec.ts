import { Test, TestingModule } from '@nestjs/testing';
import { TermPolicyService } from './term-policy.service';

describe('TermPolicyService', () => {
  let service: TermPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TermPolicyService],
    }).compile();

    service = module.get<TermPolicyService>(TermPolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
