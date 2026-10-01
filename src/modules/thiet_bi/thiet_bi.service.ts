import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateThietBiDto } from "./dto/create-thiet_bi.dto";
import { UpdateThietBiDto } from "./dto/update-thiet_bi.dto";
import { ThietBi } from "./entities/thiet_bi.entity";
import { Repository } from "typeorm";

@Injectable()
export class ThietBiService {
  constructor(
    @InjectRepository(ThietBi)
    private readonly thietBiRepository: Repository<ThietBi>,
  ) {}

  async create(createThietBiDto: CreateThietBiDto): Promise<ThietBi> {
    const thietBi = this.thietBiRepository.create(createThietBiDto);
    return await this.thietBiRepository.save(thietBi);
  }

  async findAll(): Promise<ThietBi[]> {
    return await this.thietBiRepository.find();
  }

  async findOne(id: number): Promise<ThietBi | null> {
    const thietBi = await this.thietBiRepository.findOneBy({ id });
    if (!thietBi) {
      throw new NotFoundException(`Không tìm thấy thiết bị có ID = ${id}`);
    }
    return thietBi;
  }

  async update(id: number, updateThietBiDto: UpdateThietBiDto): Promise<any> {
    const thietBi = await this.findOne(id);
    Object.assign(thietBi, updateThietBiDto);
    return await this.thietBiRepository.save(thietBi);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.thietBiRepository.delete({ id });
    return { message: `Xóa thành công thiết bị có ID = ${id}` };
  }
}
