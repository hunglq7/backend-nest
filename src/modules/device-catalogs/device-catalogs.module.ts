import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import {
  LoaiBaoTriController,
  LoaiHieuChuanController,
  LoaiKiemDinhController,
  TrangThaiThietBiController,
} from "./catalogs.controller";
import { CatalogsService } from "./catalogs.service";
import { LoaiBaoTri } from "./entities/loai-bao-tri.entity";
import { LoaiHieuChuan } from "./entities/loai-hieu-chuan.entity";
import { LoaiKiemDinh } from "./entities/loai-kiem-dinh.entity";
import { TrangThaiThietBi } from "./entities/trang-thai-thiet-bi.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoaiBaoTri,
      LoaiHieuChuan,
      LoaiKiemDinh,
      TrangThaiThietBi,
    ]),
    AuthModule,
  ],
  controllers: [
    LoaiBaoTriController,
    LoaiHieuChuanController,
    LoaiKiemDinhController,
    TrangThaiThietBiController,
  ],
  providers: [CatalogsService],
})
export class DeviceCatalogsModule {}
