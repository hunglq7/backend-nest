import { Module } from '@nestjs/common';
import { ViTriLapDatService } from './vi_tri_lap_dat.service';
import { ViTriLapDatController } from './vi_tri_lap_dat.controller';

@Module({
  controllers: [ViTriLapDatController],
  providers: [ViTriLapDatService],
})
export class ViTriLapDatModule {}
