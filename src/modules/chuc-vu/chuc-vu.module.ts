import { Module } from '@nestjs/common';
import { ChucVuService } from './chuc-vu.service';
import { ChucVuController } from './chuc-vu.controller';

@Module({
  controllers: [ChucVuController],
  providers: [ChucVuService],
})
export class ChucVuModule {}
