import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateKhuVucDto } from './dto/create-khu_vuc.dto';
import { UpdateKhuVucDto } from './dto/update-khu_vuc.dto';
import { KhuVuc } from './entities/khu_vuc.entity';
import { In, Repository } from 'typeorm';
@Injectable()
export class KhuVucService {
     constructor(
          @InjectRepository(KhuVuc)
          private readonly khuVucRepository: Repository<KhuVuc>,
        ) {}  
 async create(createKhuVucDto: CreateKhuVucDto):Promise<KhuVuc> {
    const khuVuc = this.khuVucRepository.create(createKhuVucDto);
    return this.khuVucRepository.save(khuVuc);
  }

 async findAll():Promise<KhuVuc[]> {
    return this.khuVucRepository.find();
  }

  async findOne(id: number):Promise<KhuVuc> {
    const khuVuc = await this.khuVucRepository.findOne({ where: { id } });
    if (!khuVuc) {
      throw new NotFoundException(`Khu vực với ID ${id} không tồn tại`);
    }
    return khuVuc;
  }

  async update(id: number, updateKhuVucDto: UpdateKhuVucDto):Promise<KhuVuc> {
    const khuVuc = await this.findOne(id);
    Object.assign(khuVuc, updateKhuVucDto);
    return this.khuVucRepository.save(khuVuc);
  }

  async remove(id: number):Promise<{ message: string }> {
    const khuVuc = await this.findOne(id);
    await this.khuVucRepository.remove(khuVuc);
    return { message: `Đã xóa thành công khu vực ID = ${id}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.khuVucRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} khu vực`,
    };
  }
  
}
