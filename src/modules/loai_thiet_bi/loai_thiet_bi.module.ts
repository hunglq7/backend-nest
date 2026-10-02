import { Module } from '@nestjs/common';
import { LoaiThietBiService } from './loai_thiet_bi.service';
import { LoaiThietBiController } from './loai_thiet_bi.controller';

@Module({
  controllers: [LoaiThietBiController],
  providers: [LoaiThietBiService],
})
export class LoaiThietBiModule {}
