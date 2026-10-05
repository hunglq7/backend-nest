import { Test, TestingModule } from '@nestjs/testing';
import { ChucVuService } from './chuc-vu.service';

describe('ChucVuService', () => {
  let service: ChucVuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChucVuService],
    }).compile();

    service = module.get<ChucVuService>(ChucVuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
