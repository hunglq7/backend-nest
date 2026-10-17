import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { CreateLoaiThietBiDto } from "./dto/create-loai_thiet_bi.dto";
import { UpdateLoaiThietBiDto } from "./dto/update-loai_thiet_bi.dto";
import { LoaiThietBi } from "./entities/loai_thiet_bi.entity";
import {
  assertUniqueFields,
  isDuplicateEntryError,
} from "../../common/utils/unique-validator.util";

@Injectable()
export class LoaiThietBiService {
  constructor(
    @InjectRepository(LoaiThietBi)
    private loaiThietBiRepository: Repository<LoaiThietBi>,
  ) {}

  // Định nghĩa tên nhãn hiển thị tiếng Việt khi bị trùng dữ liệu
  private readonly fieldLabels: Partial<Record<keyof LoaiThietBi, string>> = {
    ma_loai_thiet_bi: "Mã loại thiết bị",
    // Nếu có thêm trường cần check unique (ví dụ loai_thiet_bi), bạn có thể thêm vào đây:
    loai_thiet_bi: "Tên loại thiết bị",
  };

  async create(
    createLoaiThietBiDto: CreateLoaiThietBiDto,
  ): Promise<{ message: string }> {
    // Kiểm tra trùng lặp trước khi lưu bằng hàm dùng chung
    await assertUniqueFields(
      this.loaiThietBiRepository,
      createLoaiThietBiDto,
      undefined,
      this.fieldLabels,
    );

    const loaiThietBi = this.loaiThietBiRepository.create(createLoaiThietBiDto);
    try {
      await this.loaiThietBiRepository.save(loaiThietBi);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: `Loại thiết bị đã được thêm thành công` };
  }

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const where = search
      ? [
          { ma_loai_thiet_bi: Like(`%${search}%`) },
          { loai_thiet_bi: Like(`%${search}%`) },
        ]
      : undefined;
    const [data, total] = await this.loaiThietBiRepository.findAndCount({
      where,
      order: { id: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const pageData =
      effectivePage === page
        ? data
        : await this.loaiThietBiRepository.find({
            where,
            order: { id: "ASC" },
            skip: (effectivePage - 1) * limit,
            take: limit,
          });

    return { data: pageData, total, page: effectivePage, limit, totalPages };
  }

  async findOne(id: number): Promise<LoaiThietBi> {
    const loaiThietBi = await this.loaiThietBiRepository.findOneBy({ id });
    if (!loaiThietBi) {
      throw new NotFoundException(`Không tìm thấy bản ghi có ID = ${id}`);
    }
    return loaiThietBi;
  }

  async update(
    id: number,
    updateLoaiThietBiDto: UpdateLoaiThietBiDto,
  ): Promise<{ message: string }> {
    const loaiThietBi = await this.findOne(id);

    // Kiểm tra trùng lặp ngoại trừ ID hiện tại bằng hàm dùng chung
    await assertUniqueFields(
      this.loaiThietBiRepository,
      updateLoaiThietBiDto,
      id,
      this.fieldLabels,
    );

    try {
      await this.loaiThietBiRepository.update(id, {
        ...loaiThietBi,
        ...updateLoaiThietBiDto,
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: `Đã cập nhật thành công 1 bản ghi có ID = ${id}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const loaiThietBi = await this.findOne(id);
    await this.loaiThietBiRepository.remove(loaiThietBi);
    return { message: `Đã xóa thành công 1 bản ghi có ID = ${id}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.loaiThietBiRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
