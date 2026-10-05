import { Test, TestingModule } from '@nestjs/testing';
import { ChucVuController } from './chuc-vu.controller';
import { ChucVuService } from './chuc-vu.service';

describe('ChucVuController', () => {
  let controller: ChucVuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChucVuController],
      providers: [ChucVuService],
    }).compile();

    controller = module.get<ChucVuController>(ChucVuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
