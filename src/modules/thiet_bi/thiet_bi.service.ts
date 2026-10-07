import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateThietBiDto } from "./dto/create-thiet_bi.dto";
import { UpdateThietBiDto } from "./dto/update-thiet_bi.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ThietBi } from "./entities/thiet_bi.entity";
import { Repository ,In, Like} from "typeorm";


export type PaginatedThietBi = {
  data: ThietBi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class ThietBiService {
  constructor(
    @InjectRepository(ThietBi)
    private readonly thietBiRepository: Repository<ThietBi>,
  ) {}

  async create(createThietBiDto: CreateThietBiDto): Promise<{message:string}> {
    const thietBi = this.thietBiRepository.create(createThietBiDto);
    await this.thietBiRepository.save(thietBi);
    return {message:'Thêm thành công 1 bản ghi'}
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedThietBi> {
     const { page, limit, search } = query;
     const where = search ? { name: Like(`%${search}%`) } : undefined;
     const findOptions = {
       where,
       order: { id: "ASC" as const },
       skip: (page - 1) * limit,
       take: limit,
     };
     const [data, total] = await this.thietBiRepository.findAndCount(findOptions);
     const totalPages = Math.ceil(total / limit);
     const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
 
     if (effectivePage !== page) {
       const lastPageData = await this.thietBiRepository.find({
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
  async findOne(id: number): Promise<ThietBi | null> {
    const thietBi = await this.thietBiRepository.findOneBy({ id });
    if (!thietBi) {
      throw new NotFoundException(`Không tìm thấy thiết bị có ID = ${id}`);
    }
    return thietBi;
  }

  async update(id: number, updateThietBiDto: UpdateThietBiDto): Promise<{message:string}> {
    const thietBi = await this.findOne(id);
    Object.assign(thietBi, updateThietBiDto);
    await this.thietBiRepository.save(thietBi);
    return {message:`Cập nhật thành công bản ghi: ${thietBi.name}`}
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.thietBiRepository.delete({ id });
    return { message: `Xóa thành công thiết bị có ID = ${id}` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const result = await this.thietBiRepository.delete({ id: In(ids) });
    return {
      message: `Đã xóa thành công ${result.affected ?? 0} bản ghi`,
    };
  }
}
