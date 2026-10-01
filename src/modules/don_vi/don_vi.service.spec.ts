import { Test, TestingModule } from '@nestjs/testing';
import { DonViService } from './don_vi.service';

describe('DonViService', () => {
  let service: DonViService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonViService],
    }).compile();

    service = module.get<DonViService>(DonViService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
