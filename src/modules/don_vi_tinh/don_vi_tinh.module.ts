import { Module } from "@nestjs/common";
import { DonViTinhService } from "./don_vi_tinh.service";
import { DonViTinhController } from "./don_vi_tinh.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { DonViTinh } from "./entities/don_vi_tinh.entity";
@Module({
  imports: [TypeOrmModule.forFeature([DonViTinh]), AuthModule],
  controllers: [DonViTinhController],
  providers: [DonViTinhService],
})
export class DonViTinhModule {}
