import { Module } from "@nestjs/common";
import { ThietBiService } from "./thiet_bi.service";
import { ThietBiController } from "./thiet_bi.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThietBi } from "./entities/thiet_bi.entity";
@Module({
  imports: [TypeOrmModule.forFeature([ThietBi]), AuthModule],
  controllers: [ThietBiController],
  providers: [ThietBiService],
})
export class ThietBiModule {}
