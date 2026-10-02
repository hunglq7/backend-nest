import { Module } from '@nestjs/common';
import { DonViTinhService } from './don_vi_tinh.service';
import { DonViTinhController } from './don_vi_tinh.controller';

@Module({
  controllers: [DonViTinhController],
  providers: [DonViTinhService],
})
export class DonViTinhModule {}
