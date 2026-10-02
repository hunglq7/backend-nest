import { Injectable } from '@nestjs/common';
import { CreateViTriLapDatDto } from './dto/create-vi_tri_lap_dat.dto';
import { UpdateViTriLapDatDto } from './dto/update-vi_tri_lap_dat.dto';

@Injectable()
export class ViTriLapDatService {
  create(createViTriLapDatDto: CreateViTriLapDatDto) {
    return 'This action adds a new viTriLapDat';
  }

  findAll() {
    return `This action returns all viTriLapDat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} viTriLapDat`;
  }

  update(id: number, updateViTriLapDatDto: UpdateViTriLapDatDto) {
    return `This action updates a #${id} viTriLapDat`;
  }

  remove(id: number) {
    return `This action removes a #${id} viTriLapDat`;
  }
}
