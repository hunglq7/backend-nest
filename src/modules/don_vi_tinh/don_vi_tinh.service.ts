import { Injectable, NotFoundException,ConflictException, } from "@nestjs/common";
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
function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "ER_DUP_ENTRY";
}

function throwDuplicateField(field: "ma_don_vi_tinh" | "ten_don_vi_tinh"): never {
  const isCode = field === "ma_don_vi_tinh";
  const label = isCode ? "Mã đơn vị tính" : "Tên đơn vị tính";
  throw new ConflictException({
    field,
    message: `${label} đã tồn tại. Vui lòng nhập ${isCode ? "mã" : "tên"} khác.`,
  });
}

function getDuplicateField(
  error: unknown,
): "ma_don_vi_tinh" | "ten_don_vi_tinh" | null {
  if (!isDuplicateEntryError(error) || typeof error !== "object" || error === null) {
    return null;
  }
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";
  if (message.includes("ma_don_vi_tinh")) return "ma_don_vi_tinh";
  if (message.includes("ten_don_vi_tinh")) return "ten_don_vi_tinh";
  return null;
}

@Injectable()
export class DonViTinhService {
  constructor(
    @InjectRepository(DonViTinh)
    private donViTinhRepository: Repository<DonViTinh>,
  ) {}

  async create(
    createDonViTinhDto: CreateDonViTinhDto,
  ): Promise<{ message: string }> {
    await this.assertUniqueFields(createDonViTinhDto);
    const donViTinh = this.donViTinhRepository.create(createDonViTinhDto);
    try {
      await this.donViTinhRepository.save(donViTinh);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        const field = getDuplicateField(error);
        if (field) throwDuplicateField(field);
        throw new ConflictException("Mã hoặc tên đơn vị tính đã tồn tại.");
      }
      throw error;
    }
    
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  private async assertUniqueFields(
    fields: Partial<Pick<DonViTinh, "ma_don_vi_tinh" | "ten_don_vi_tinh">>,
    exceptId?: number,
  ) {
    if (fields.ma_don_vi_tinh) {
      const existing = await this.donViTinhRepository.findOneBy({
        ma_don_vi_tinh: fields.ma_don_vi_tinh,
      });
      if (existing && existing.id !== exceptId) {
        throwDuplicateField("ma_don_vi_tinh");
      }
    }
    if (fields.ten_don_vi_tinh) {
      const existing = await this.donViTinhRepository.findOneBy({
        ten_don_vi_tinh: fields.ten_don_vi_tinh,
      });
      if (existing && existing.id !== exceptId) {
        throwDuplicateField("ten_don_vi_tinh");
      }
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedDonViTinh> {
    const { page, limit, search } = query;
    const where = search
      ? [
          { ma_don_vi_tinh: Like(`%${search}%`) },
          { ten_don_vi_tinh: Like(`%${search}%`) },
        ]
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

  findOne(id: number): Promise<DonViTinh> {
    return this.donViTinhRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateDonViTinhDto: UpdateDonViTinhDto,
  ): Promise<{ message: string }> {
    const donViTinh = await this.findOne(id);
    Object.assign(donViTinh, updateDonViTinhDto);
    await this.assertUniqueFields(updateDonViTinhDto, id);
    try {
      await this.donViTinhRepository.save(donViTinh);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        const field = getDuplicateField(error);
        if (field) throwDuplicateField(field);
        throw new ConflictException("Mã hoặc tên đơn vị tính đã tồn tại.");
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
