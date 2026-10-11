import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { CreateViTriLapDatDto } from "./dto/create-vi_tri_lap_dat.dto";
import { UpdateViTriLapDatDto } from "./dto/update-vi_tri_lap_dat.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ViTriLapDat } from "./entities/vi_tri_lap_dat.entity";

export type PaginatedViTriLapDat = {
  data: ViTriLapDat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class ViTriLapDatService {
  constructor(
    @InjectRepository(ViTriLapDat)
    private readonly vitrilapdatRepository: Repository<ViTriLapDat>,
  ) {}
  async create(
    createViTriLapDatDto: CreateViTriLapDatDto,
  ): Promise<{ message: string }> {
    await this.assertUniqueCode(createViTriLapDatDto.ma_vi_tri_lap_dat);
    const res = this.vitrilapdatRepository.create(createViTriLapDatDto);
    try {
      await this.vitrilapdatRepository.save(res);
    } catch (error) {
      if (this.isDuplicateEntryError(error)) this.throwDuplicateCode();
      throw error;
    }
    return { message: "Thêm mới thành công 1 bản ghi" };
  }

  private isDuplicateEntryError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    );
  }

  private throwDuplicateCode(): never {
    throw new ConflictException({
      field: "ma_vi_tri_lap_dat",
      message: "Mã vị trí lắp đặt đã tồn tại. Vui lòng nhập mã khác.",
    });
  }

  private async assertUniqueCode(code: string, exceptId?: number) {
    const existing = await this.vitrilapdatRepository.findOneBy({
      ma_vi_tri_lap_dat: code,
    });
    if (existing && existing.id !== exceptId) this.throwDuplicateCode();
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedViTriLapDat> {
    const { page, limit, search } = query;
    const where = search
      ? [
          { ma_vi_tri_lap_dat: Like(`%${search}%`) },
          { ten_vi_tri: Like(`%${search}%`) },
        ]
      : undefined;
    const findOptions = {
      where,
      order: { id: "ASC" as const },
      skip: (page - 1) * limit,
      take: limit,
    };
    const [data, total] =
      await this.vitrilapdatRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    if (effectivePage !== page) {
      const lastPageData = await this.vitrilapdatRepository.find({
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

  async findOne(id: number): Promise<ViTriLapDat> {
    const res = await this.vitrilapdatRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Không tìm thấy bản ghi có ID = ${id}`);
    }
    return res;
  }

  async update(
    id: number,
    updateViTriLapDatDto: UpdateViTriLapDatDto,
  ): Promise<{ message: string }> {
    const res = await this.findOne(id);
    Object.assign(res, updateViTriLapDatDto);
    if (updateViTriLapDatDto.ma_vi_tri_lap_dat) {
      await this.assertUniqueCode(updateViTriLapDatDto.ma_vi_tri_lap_dat, id);
    }
    try {
      await this.vitrilapdatRepository.save(res);
    } catch (error) {
      if (this.isDuplicateEntryError(error)) this.throwDuplicateCode();
      throw error;
    }
    return { message: `Đã cập nhật thành công bản ghi ${res.ten_vi_tri}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const res = await this.findOne(id);
    if (!res) {
      throw new NotFoundException(`không xóa được bản ghi chó Id: ${id}`);
    }
    await this.vitrilapdatRepository.remove(res);
    return { message: `Xóa thành công bản ghi có ID:${id}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.vitrilapdatRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
