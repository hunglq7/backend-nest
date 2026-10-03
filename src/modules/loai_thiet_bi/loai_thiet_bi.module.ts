import { Module } from '@nestjs/common';
import { LoaiThietBiService } from './loai_thiet_bi.service';
import { LoaiThietBiController } from './loai_thiet_bi.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoaiThietBi } from './entities/loai_thiet_bi.entity';
@Module({
  imports: [TypeOrmModule.forFeature([LoaiThietBi]),AuthModule],
  controllers: [LoaiThietBiController],
  providers: [LoaiThietBiService],

})
export class LoaiThietBiModule { }
