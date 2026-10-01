import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonViDto } from './dto/create-don_vi.dto';
import { UpdateDonViDto } from './dto/update-don_vi.dto';
import { DonVi } from './entities/don_vi.entity';
@Injectable()
export class DonViService {
    constructor(
        @InjectRepository(DonVi)
        private readonly donviRepository: Repository<DonVi>,
      ) {}  
 async create(createDonViDto: CreateDonViDto) {
   const donvi = this.donviRepository.create(createDonViDto);
    return await this.donviRepository.save(donvi);
  }

 async findAll():Promise<DonVi[]> {
    return await this.donviRepository.find();
  }

 async findOne(id: number):Promise<DonVi> {
      const donvi = await this.donviRepository.findOneBy({ id });
    if (!donvi) {
      throw new NotFoundException(`Không tìm thấy đơn vị có ID = ${id}`);
    }
    return donvi;
  }

 async update(id: number, updateDonViDto: UpdateDonViDto):Promise<DonVi> {
    const donvi = await this.findOne(id);
    Object.assign(donvi, updateDonViDto);
    return await this.donviRepository.save(donvi);
  }
  

 async remove(id: number): Promise<{ message: string }> {
     const donvi= await this.findOne(id);
    await this.donviRepository.remove(donvi);
    return { message: `Đã xóa thành công đơn vị ID = ${id}` };
  }
}
