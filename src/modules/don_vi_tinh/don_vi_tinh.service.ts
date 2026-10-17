import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { CreateDonViTinhDto } from "./dto/create_don_vi_tinh.dto";
import { UpdateDonViTinhDto } from "./dto/update_don_vi_tinh.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { DonViTinh } from "./entities/don_vi_tinh.entity";
// Import hàm dùng chung vừa tạo
import {
  assertUniqueFields,
  isDuplicateEntryError,
} from "../../common/utils/unique-validator.util";

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
    private readonly donViTinhRepository: Repository<DonViTinh>,
  ) {}

  private readonly fieldLabels: Partial<Record<keyof DonViTinh, string>> = {
    ma_don_vi_tinh: "Mã đơn vị tính",
    ten_don_vi_tinh: "Tên đơn vị tính",
  };

  async create(
    createDonViTinhDto: CreateDonViTinhDto,
  ): Promise<{ message: string }> {
    await assertUniqueFields(
      this.donViTinhRepository,
      createDonViTinhDto,
      undefined,
      this.fieldLabels,
    );

    const donViTinh = this.donViTinhRepository.create(createDonViTinhDto);
    try {
      await this.donViTinhRepository.save(donViTinh);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedDonViTinh> {
    const { page, limit, search } = query;
    const where = search
      ? { ten_don_vi_tinh: Like(`%${search}%`) }
      : undefined;
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

  async findOne(id: number): Promise<DonViTinh> {
    const donViTinh = await this.donViTinhRepository.findOneBy({ id });
    if (!donViTinh) {
      throw new NotFoundException(`Không tìm thấy bản ghi có ID = ${id}`);
    }
    return donViTinh;
  }

  async update(
    id: number,
    updateDonViTinhDto: UpdateDonViTinhDto,
  ): Promise<{ message: string }> {
    const donViTinh = await this.findOne(id);
    Object.assign(donViTinh, updateDonViTinhDto);

    await assertUniqueFields(
      this.donViTinhRepository,
      updateDonViTinhDto,
      id,
      this.fieldLabels,
    );

    try {
      await this.donViTinhRepository.save(donViTinh);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return {
      message: `Đã cập nhật thành công bản ghi ${donViTinh.ten_don_vi_tinh}`,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const donViTinh = await this.findOne(id);
    await this.donViTinhRepository.remove(donViTinh);
    return {
      message: `Đã xóa thành công bản ghi ${donViTinh.ten_don_vi_tinh}`,
    };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.donViTinhRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
