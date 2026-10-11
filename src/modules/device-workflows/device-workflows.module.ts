import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { DeviceCatalogsModule } from "../device-catalogs/device-catalogs.module";
import { Users } from "../users/entities/user.entity";
import { ThietBi } from "../thiet_bi/entities/thiet_bi.entity";
import { ViTriLapDat } from "../vi_tri_lap_dat/entities/vi_tri_lap_dat.entity";
import {
  HandoverController,
  MoveController,
  ReceiptController,
  StatusUpdateController,
} from "./device-workflows.controller";
import { DeviceWorkflowsService } from "./device-workflows.service";
import { DeviceWorkflow } from "./entities/device-workflow.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceWorkflow, ThietBi, Users, ViTriLapDat]),
    DeviceCatalogsModule,
    AuthModule,
  ],
  controllers: [
    HandoverController,
    ReceiptController,
    MoveController,
    StatusUpdateController,
  ],
  providers: [DeviceWorkflowsService],
})
export class DeviceWorkflowsModule {}
