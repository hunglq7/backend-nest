import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { CreateCatalogDto } from "./dto/create-catalog.dto";
import { UpdateCatalogDto } from "./dto/update-catalog.dto";
import { LoaiBaoTri } from "./entities/loai-bao-tri.entity";
import { LoaiHieuChuan } from "./entities/loai-hieu-chuan.entity";
import { LoaiKiemDinh } from "./entities/loai-kiem-dinh.entity";
import { TrangThaiThietBi } from "./entities/trang-thai-thiet-bi.entity";

export type CatalogKey =
  | "loai-bao-tris"
  | "loai-hieu-chuans"
  | "loai-kiem-dinhs"
  | "trang-thai-thiet-bis";

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(LoaiBaoTri) private readonly baoTri: Repository<LoaiBaoTri>,
    @InjectRepository(LoaiHieuChuan)
    private readonly hieuChuan: Repository<LoaiHieuChuan>,
    @InjectRepository(LoaiKiemDinh)
    private readonly kiemDinh: Repository<LoaiKiemDinh>,
    @InjectRepository(TrangThaiThietBi)
    private readonly trangThai: Repository<TrangThaiThietBi>,
  ) {}

  private repository(key: CatalogKey): Repository<any> {
    return {
      "loai-bao-tris": this.baoTri,
      "loai-hieu-chuans": this.hieuChuan,
      "loai-kiem-dinhs": this.kiemDinh,
      "trang-thai-thiet-bis": this.trangThai,
    }[key];
  }

  async findAll(key: CatalogKey, query: PaginationQueryDto) {
    const repo = this.repository(key);
    const where = query.search
      ? [
          { code: Like(`%${query.search}%`) },
          { name: Like(`%${query.search}%`) },
          { description: Like(`%${query.search}%`) },
          { notes: Like(`%${query.search}%`) },
        ]
      : undefined;
    const [data, total] = await repo.findAndCount({
      where,
      order: { id: "ASC" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const pageData =
      page === query.page
        ? data
        : await repo.find({
            where,
            order: { id: "ASC" },
            skip: (page - 1) * query.limit,
            take: query.limit,
          });
    return { data: pageData, total, page, limit: query.limit, totalPages };
  }

  async findOne(key: CatalogKey, id: number) {
    const item = await this.repository(key).findOneBy({ id });
    if (!item) throw new NotFoundException(`Catalog item ${id} not found`);
    return item;
  }

  async create(key: CatalogKey, dto: CreateCatalogDto) {
    const repo = this.repository(key);
    if (await repo.findOneBy({ code: dto.code })) {
      throw new ConflictException("code already exists");
    }
    if (dto.parent != null && !(await repo.exist({ where: { id: dto.parent } }))) {
      throw new NotFoundException(`Parent catalog item ${dto.parent} not found`);
    }
    return repo.save(repo.create(dto));
  }

  async update(key: CatalogKey, id: number, dto: UpdateCatalogDto) {
    const repo = this.repository(key);
    const item = await this.findOne(key, id);
    if (dto.parent === id) {
      throw new ConflictException("A catalog item cannot be its own parent");
    }
    if (dto.code && dto.code !== item.code) {
      const duplicate = await repo.findOneBy({ code: dto.code });
      if (duplicate) throw new ConflictException("code already exists");
    }
    if (dto.parent != null && !(await repo.exist({ where: { id: dto.parent } }))) {
      throw new NotFoundException(`Parent catalog item ${dto.parent} not found`);
    }
    if (item.locked && !(dto.locked === false && Object.keys(dto).length === 1)) {
      throw new ConflictException("Locked catalog items cannot be edited");
    }
    Object.assign(item, dto);
    return repo.save(item);
  }

  async deactivate(key: CatalogKey, id: number) {
    const item = await this.findOne(key, id);
    if (item.locked) {
      throw new ConflictException("Locked catalog items cannot be deactivated");
    }
    item.isActive = false;
    await this.repository(key).save(item);
    return { message: `Catalog item ${id} deactivated` };
  }
}
