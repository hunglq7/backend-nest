import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateKhuVucDto } from "./dto/create-khu_vuc.dto";
import { UpdateKhuVucDto } from "./dto/update-khu_vuc.dto";
import { KhuVuc } from "./entities/khu_vuc.entity";
import { In, Like, Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
@Injectable()
export class KhuVucService {
  constructor(
    @InjectRepository(KhuVuc)
    private readonly khuVucRepository: Repository<KhuVuc>,
  ) {}
  async create(createKhuVucDto: CreateKhuVucDto): Promise<{ message: string }> {
    const khuVuc = this.khuVucRepository.create(createKhuVucDto);
    await this.khuVucRepository.save(khuVuc);
    return { message: "Đã thêm thành công 1 bản ghi" };
  }

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const where = search ? { Tên_khu_vuc: Like(`%${search}%`) } : undefined;
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
    await this.khuVucRepository.save(khuVuc);
    return { message: `Đã cập nhật thành công bản ghi ${khuVuc.Tên_khu_vuc}` };
  }

  async remove(id: number): Promise<{ message: string }> {
    const khuVuc = await this.findOne(id);
    await this.khuVucRepository.remove(khuVuc);
    return { message: `Đã xóa thành công bản ghi ${khuVuc.Tên_khu_vuc}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.khuVucRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
