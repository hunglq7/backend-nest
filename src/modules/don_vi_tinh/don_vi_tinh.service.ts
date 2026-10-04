import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { CreateDonViTinhDto } from "./dto/create-don_vi_tinh.dto";
import { UpdateDonViTinhDto } from "./dto/update-don_vi_tinh.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { DonViTinh } from "./entities/don_vi_tinh.entity";

export type PaginatedDonViTinh = {
  data: DonViTinh[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class DonViTinhService {
  constructor(
    @InjectRepository(DonViTinh)
    private donViTinhRepository: Repository<DonViTinh>,
  ) {}

  async create(
    createDonViTinhDto: CreateDonViTinhDto,
  ): Promise<{ message: string }> {
    const donViTinh = this.donViTinhRepository.create(createDonViTinhDto);
    await this.donViTinhRepository.save(donViTinh);
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedDonViTinh> {
    const { page, limit, search } = query;
    const where = search ? { name: Like(`%${search}%`) } : undefined;
    const findOptions = {
      where,
      order: { id: "ASC" as const },
      skip: (page - 1) * limit,
      take: limit,
    };
    const [data, total] =
      await this.donViTinhRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    if (effectivePage !== page) {
      const lastPageData = await this.donViTinhRepository.find({
        ...findOptions,
        skip: (effectivePage - 1) * limit,
      });
      return {
        data: lastPageData,
        total,
        page: effectivePage,
        limit,
        totalPages,
      };
    }

    return { data, total, page: effectivePage, limit, totalPages };
  }

  findOne(id: number): Promise<DonViTinh> {
    return this.donViTinhRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateDonViTinhDto: UpdateDonViTinhDto,
  ): Promise<{ message: string }> {
    const donViTinh = await this.findOne(id);
    Object.assign(donViTinh, updateDonViTinhDto);
    await this.donViTinhRepository.save(donViTinh);
    return { message: `Đã cập nhật thành công bản ghi ${donViTinh.name}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const donViTinh = await this.findOne(id);
    await this.donViTinhRepository.remove(donViTinh);
    return { message: `Đã xóa thành công bản ghi ${donViTinh.name}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.donViTinhRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
