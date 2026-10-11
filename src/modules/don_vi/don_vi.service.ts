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

type DonViField = "ma_don_vi" | "ten_don_vi";

function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return error.code === "ER_DUP_ENTRY";
}

function getDuplicateField(error: unknown): DonViField | null {
  if (!isDuplicateEntryError(error) || typeof error !== "object" || error === null) {
    return null;
  }

  const message = "message" in error && typeof error.message === "string"
    ? error.message.toLowerCase()
    : "";

  if (message.includes("ma_don_vi")) return "ma_don_vi";
  if (message.includes("ten_don_vi") || message.includes("uq_ten_don_vi")) {
    return "ten_don_vi";
  }
  return null;
}

function throwDuplicateField(field: DonViField): never {
  const label = field === "ma_don_vi" ? "Mã đơn vị" : "Tên đơn vị";
  throw new ConflictException({
    field,
    message: `${label} đã tồn tại. Vui lòng nhập ${label.toLowerCase()} khác.`,
  });
}

@Injectable()
export class DonViService {
  constructor(
    @InjectRepository(DonVi)
    private readonly donviRepository: Repository<DonVi>,
  ) {}

  async create(createDonViDto: CreateDonViDto): Promise<{ message: string }> {
    await this.assertUniqueFields(createDonViDto);
    const donvi = this.donviRepository.create(createDonViDto);
    try {
      await this.donviRepository.save(donvi);
    } catch (error) {
      const field = getDuplicateField(error);
      if (field) throwDuplicateField(field);
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  private async assertUniqueFields(
    fields: Partial<Pick<DonVi, DonViField>>,
    exceptId?: number,
  ): Promise<void> {
    if (fields.ma_don_vi) {
      const existing = await this.donviRepository.findOneBy({
        ma_don_vi: fields.ma_don_vi,
      });
      if (existing && existing.id !== exceptId) {
        throwDuplicateField("ma_don_vi");
      }
    }

    if (fields.ten_don_vi) {
      const existing = await this.donviRepository.findOneBy({
        ten_don_vi: fields.ten_don_vi,
      });
      if (existing && existing.id !== exceptId) {
        throwDuplicateField("ten_don_vi");
      }
    }
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
    await this.assertUniqueFields(updateDonViDto, id);
    try {
      await this.donviRepository.save(donvi);
    } catch (error) {
      const field = getDuplicateField(error);
      if (field) throwDuplicateField(field);
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
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
