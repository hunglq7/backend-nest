import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { CreateDonViDto } from "./dto/create-don_vi.dto";
import { UpdateDonViDto } from "./dto/update-don_vi.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { DonVi } from "./entities/don_vi.entity";

export type PaginatedDonVi = {
  data: DonVi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "ER_DUP_ENTRY";
}

@Injectable()
export class DonViService {
  constructor(
    @InjectRepository(DonVi)
    private readonly donviRepository: Repository<DonVi>,
  ) {}

  async create(createDonViDto: CreateDonViDto): Promise<{ message: string }> {
    const donvi = this.donviRepository.create(createDonViDto);
    try {
      await this.donviRepository.save(donvi);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Tên đơn vị đã tồn tại. Vui lòng nhập tên khác.");
      }
      throw error;
    }
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedDonVi> {
    const { page, limit, search } = query;
    const where = search ? { ten_don_vi: Like(`%${search}%`) } : undefined;
    const findOptions = {
      where,
      order: { id: "ASC" as const },
      skip: (page - 1) * limit,
      take: limit,
    };
    const [data, total] = await this.donviRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    if (effectivePage !== page) {
      const lastPageData = await this.donviRepository.find({
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
    try {
      await this.donviRepository.save(donvi);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Tên đơn vị đã tồn tại. Vui lòng nhập tên khác.");
      }
      throw error;
    }
    return { message: `Đã cập nhật thành công bản ghi ${donvi.ten_don_vi}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const donvi = await this.findOne(id);
    if (!donvi) {
      throw new NotFoundException(`không xóa được bản ghi chó Id: ${id}`);
    }
    await this.donviRepository.remove(donvi);
    return { message: `Đã xóa thành công bản ghi ${donvi.ten_don_vi}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.donviRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
