import { PartialType } from '@nestjs/mapped-types';
import { CreateViTriLapDatDto } from './create-vi_tri_lap_dat.dto';

export class UpdateViTriLapDatDto extends PartialType(CreateViTriLapDatDto) {}
