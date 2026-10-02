import { Injectable } from '@nestjs/common';
import { CreateLoaiThietBiDto } from './dto/create-loai_thiet_bi.dto';
import { UpdateLoaiThietBiDto } from './dto/update-loai_thiet_bi.dto';

@Injectable()
export class LoaiThietBiService {
  create(createLoaiThietBiDto: CreateLoaiThietBiDto) {
    return 'This action adds a new loaiThietBi';
  }

  findAll() {
    return `This action returns all loaiThietBi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} loaiThietBi`;
  }

  update(id: number, updateLoaiThietBiDto: UpdateLoaiThietBiDto) {
    return `This action updates a #${id} loaiThietBi`;
  }

  remove(id: number) {
    return `This action removes a #${id} loaiThietBi`;
  }
}
