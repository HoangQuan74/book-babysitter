import { Test, TestingModule } from '@nestjs/testing';
import { TermPolicyController } from './term-policy.controller';
import { TermPolicyService } from './term-policy.service';

describe('TermPolicyController', () => {
  let controller: TermPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermPolicyController],
      providers: [TermPolicyService],
    }).compile();

    controller = module.get<TermPolicyController>(TermPolicyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
