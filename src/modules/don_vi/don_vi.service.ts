import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateDonViDto } from "./dto/create-don_vi.dto";
import { UpdateDonViDto } from "./dto/update-don_vi.dto";
import { DonVi } from "./entities/don_vi.entity";
@Injectable()
export class DonViService {
  constructor(
    @InjectRepository(DonVi)
    private readonly donviRepository: Repository<DonVi>,
  ) {}
  async create(createDonViDto: CreateDonViDto): Promise<{ message: string }> {
    const donvi = this.donviRepository.create(createDonViDto);
    await this.donviRepository.save(donvi);
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  async findAll(): Promise<DonVi[]> {
    return await this.donviRepository.find();
  }

  async findOne(id: number): Promise<DonVi> {
    const donvi = await this.donviRepository.findOneBy({ id });
    if (!donvi) {
      throw new NotFoundException(`Không tìm thấy bản ghi có ID = ${id}`);
    }
    return donvi;
  }

  async update(
    id: number,
    updateDonViDto: UpdateDonViDto,
  ): Promise<{ message: string }> {
    const donvi = await this.findOne(id);
    Object.assign(donvi, updateDonViDto);
    await this.donviRepository.save(donvi);
    return { message: `Đã cập nhật thành công bản ghi ${donvi.name}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const donvi = await this.findOne(id);
    await this.donviRepository.remove(donvi);
    return { message: `Đã xóa thành công bản ghi ${donvi.name}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.donviRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
