import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateKhuVucDto } from "./dto/create-khu_vuc.dto";
import { UpdateKhuVucDto } from "./dto/update-khu_vuc.dto";
import { KhuVuc } from "./entities/khu_vuc.entity";
import { In, Like, Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import {
  assertUniqueFields,
  isDuplicateEntryError,
} from "../../common/utils/unique-validator.util";

@Injectable()
export class KhuVucService {
  constructor(
    @InjectRepository(KhuVuc)
    private readonly khuVucRepository: Repository<KhuVuc>,
  ) {}

  // Định nghĩa tên nhãn tiếng Việt hiển thị khi bị trùng dữ liệu
  private readonly fieldLabels: Partial<Record<keyof KhuVuc, string>> = {
    ma_khu_vuc: "Mã khu vực",
    // Nếu entity KhuVuc có thêm trường cần check unique (ví dụ ten_khu_vuc), có thể khai báo tiếp ở đây
    ten_khu_vuc: "Tên khu vực",
  };

  async create(createKhuVucDto: CreateKhuVucDto): Promise<{ message: string }> {
    // Kiểm tra trùng lặp trước khi lưu bằng hàm dùng chung
    await assertUniqueFields(
      this.khuVucRepository,
      createKhuVucDto,
      undefined,
      this.fieldLabels,
    );

    const khuVuc = this.khuVucRepository.create(createKhuVucDto);
    try {
      await this.khuVucRepository.save(khuVuc);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: "Đã thêm thành công 1 bản ghi" };
  }

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const where = search
      ? [
          { ma_khu_vuc: Like(`%${search}%`) },
          { ten_khu_vuc: Like(`%${search}%`) },
        ]
      : undefined;
    const [data, total] = await this.khuVucRepository.findAndCount({
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
        : await this.khuVucRepository.find({
            where,
            order: { id: "ASC" },
            skip: (effectivePage - 1) * limit,
            take: limit,
          });

    return { data: pageData, total, page: effectivePage, limit, totalPages };
  }

  async findOne(id: number): Promise<KhuVuc> {
    const khuVuc = await this.khuVucRepository.findOne({ where: { id } });
    if (!khuVuc) {
      throw new NotFoundException(`Khu vực với ID ${id} không tồn tại`);
    }
    return khuVuc;
  }

  async update(
    id: number,
    updateKhuVucDto: UpdateKhuVucDto,
  ): Promise<{ message: string }> {
    const khuVuc = await this.findOne(id);
    Object.assign(khuVuc, updateKhuVucDto);

    // Kiểm tra trùng lặp ngoại trừ ID hiện tại bằng hàm dùng chung
    await assertUniqueFields(
      this.khuVucRepository,
      updateKhuVucDto,
      id,
      this.fieldLabels,
    );

    try {
      await this.khuVucRepository.save(khuVuc);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new ConflictException("Dữ liệu bị trùng lặp.");
      }
      throw error;
    }
    return { message: `Đã cập nhật thành công bản ghi ${khuVuc.ten_khu_vuc}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const khuVuc = await this.findOne(id);
    await this.khuVucRepository.remove(khuVuc);
    return { message: `Đã xóa thành công bản ghi ${khuVuc.ten_khu_vuc}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.khuVucRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
