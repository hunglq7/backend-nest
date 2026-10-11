import { Module } from "@nestjs/common";
import { ThietBiService } from "./thiet_bi.service";
import { ThietBiController } from "./thiet_bi.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThietBi } from "./entities/thiet_bi.entity";
import { ThongSoKyThuat } from "./entities/thong-so-ky-thuat.entity";
import { DeviceWorkflow } from "../device-workflows/entities/device-workflow.entity";
import { DonVi } from "../don_vi/entities/don_vi.entity";
import { DonViTinh } from "../don_vi_tinh/entities/don_vi_tinh.entity";
import { KhuVuc } from "../khu_vuc/entities/khu_vuc.entity";
import { LoaiThietBi } from "../loai_thiet_bi/entities/loai_thiet_bi.entity";
import { ViTriLapDat } from "../vi_tri_lap_dat/entities/vi_tri_lap_dat.entity";
import { TrangThaiThietBi } from "../device-catalogs/entities/trang-thai-thiet-bi.entity";
import { ThongSoKyThuatController } from "./thong-so-ky-thuat.controller";
import { ThongSoKyThuatService } from "./thong-so-ky-thuat.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThietBi,
      ThongSoKyThuat,
      DeviceWorkflow,
      LoaiThietBi,
      DonViTinh,
      DonVi,
      KhuVuc,
      ViTriLapDat,
      TrangThaiThietBi,
    ]),
    AuthModule,
  ],
  controllers: [ThietBiController, ThongSoKyThuatController],
  providers: [ThietBiService, ThongSoKyThuatService],
})
export class ThietBiModule {}
