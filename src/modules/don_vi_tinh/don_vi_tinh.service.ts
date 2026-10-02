import { Injectable } from '@nestjs/common';
import { CreateDonViTinhDto } from './dto/create-don_vi_tinh.dto';
import { UpdateDonViTinhDto } from './dto/update-don_vi_tinh.dto';

@Injectable()
export class DonViTinhService {
  create(createDonViTinhDto: CreateDonViTinhDto) {
    return 'This action adds a new donViTinh';
  }

  findAll() {
    return `This action returns all donViTinh`;
  }

  findOne(id: number) {
    return `This action returns a #${id} donViTinh`;
  }

  update(id: number, updateDonViTinhDto: UpdateDonViTinhDto) {
    return `This action updates a #${id} donViTinh`;
  }

  remove(id: number) {
    return `This action removes a #${id} donViTinh`;
  }
}
