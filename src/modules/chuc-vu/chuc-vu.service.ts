import { Injectable } from '@nestjs/common';
import { CreateChucVuDto } from './dto/create-chuc-vu.dto';
import { UpdateChucVuDto } from './dto/update-chuc-vu.dto';

@Injectable()
export class ChucVuService {
  create(createChucVuDto: CreateChucVuDto) {
    return 'This action adds a new chucVu';
  }

  findAll() {
    return `This action returns all chucVu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chucVu`;
  }

  update(id: number, updateChucVuDto: UpdateChucVuDto) {
    return `This action updates a #${id} chucVu`;
  }

  remove(id: number) {
    return `This action removes a #${id} chucVu`;
  }
}
