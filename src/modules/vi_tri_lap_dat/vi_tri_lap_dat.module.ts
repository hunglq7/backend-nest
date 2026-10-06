import { Module } from "@nestjs/common";
import { ViTriLapDatService } from "./vi_tri_lap_dat.service";
import { ViTriLapDatController } from "./vi_tri_lap_dat.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViTriLapDat } from "./entities/vi_tri_lap_dat.entity";
@Module({
  imports: [TypeOrmModule.forFeature([ViTriLapDat]), AuthModule],
  controllers: [ViTriLapDatController],
  providers: [ViTriLapDatService],
})
export class ViTriLapDatModule {}
