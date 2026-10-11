import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { CreateThietBiDto } from "./dto/create-thiet_bi.dto";
import { UpdateThietBiDto } from "./dto/update-thiet_bi.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ThietBi } from "./entities/thiet_bi.entity";
import { ThongSoKyThuat } from "./entities/thong-so-ky-thuat.entity";
import { DeviceWorkflow } from "../device-workflows/entities/device-workflow.entity";
import { DonVi } from "../don_vi/entities/don_vi.entity";
import { DonViTinh } from "../don_vi_tinh/entities/don_vi_tinh.entity";
import { KhuVuc } from "../khu_vuc/entities/khu_vuc.entity";
import { LoaiThietBi } from "../loai_thiet_bi/entities/loai_thiet_bi.entity";
import { ViTriLapDat } from "../vi_tri_lap_dat/entities/vi_tri_lap_dat.entity";
import { TrangThaiThietBi } from "../device-catalogs/entities/trang-thai-thiet-bi.entity";

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
    @InjectRepository(ThongSoKyThuat)
    private readonly specificationRepository: Repository<ThongSoKyThuat>,
    @InjectRepository(DeviceWorkflow)
    private readonly workflowRepository: Repository<DeviceWorkflow>,
    @InjectRepository(LoaiThietBi)
    private readonly deviceTypeRepository: Repository<LoaiThietBi>,
    @InjectRepository(DonViTinh)
    private readonly unitRepository: Repository<DonViTinh>,
    @InjectRepository(DonVi)
    private readonly organizationRepository: Repository<DonVi>,
    @InjectRepository(KhuVuc)
    private readonly areaRepository: Repository<KhuVuc>,
    @InjectRepository(ViTriLapDat)
    private readonly locationRepository: Repository<ViTriLapDat>,
    @InjectRepository(TrangThaiThietBi)
    private readonly statusRepository: Repository<TrangThaiThietBi>,
  ) {}

  async create(dto: CreateThietBiDto): Promise<ThietBi> {
    const name = dto.ten_thiet_bi ?? dto.name;
    if (!name?.trim()) {
      throw new BadRequestException("ten_thiet_bi is required");
    }
    await this.assertReferences(dto);
    const thietBi = this.thietBiRepository.create({
      ...dto,
      name,
      ten_thiet_bi: name,
    });
    return this.thietBiRepository.save(thietBi);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedThietBi> {
    const { page, limit, search } = query;
    const where = search
      ? [
          { name: Like(`%${search}%`) },
          { ten_thiet_bi: Like(`%${search}%`) },
          { ma_thiet_bi: Like(`%${search}%`) },
          { so_quan_ly: Like(`%${search}%`) },
        ]
      : undefined;
    const [data, total] = await this.thietBiRepository.findAndCount({
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
        : await this.thietBiRepository.find({
            where,
            order: { id: "ASC" },
            skip: (effectivePage - 1) * limit,
            take: limit,
          });
    return {
      data: pageData.map((device) => this.toApi(device)),
      total,
      page: effectivePage,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<ThietBi> {
    const device = await this.thietBiRepository.findOneBy({ id });
    if (!device) {
      throw new NotFoundException(`Equipment ${id} was not found`);
    }
    return this.toApi(device);
  }

  async update(id: number, dto: UpdateThietBiDto): Promise<ThietBi> {
    const device = await this.findOne(id);
    if (
      device.locked === true &&
      !(dto.locked === false && Object.keys(dto).length === 1)
    ) {
      throw new ConflictException("Locked equipment cannot be edited");
    }
    await this.assertReferences(dto);
    const updatedName = dto.ten_thiet_bi ?? dto.name;
    Object.assign(device, dto);
    if (updatedName !== undefined) {
      device.name = updatedName;
      device.ten_thiet_bi = updatedName;
    }
    return this.thietBiRepository.save(device);
  }

  async remove(id: number): Promise<{ message: string }> {
    const device = await this.findOne(id);
    await this.assertRemovable([id], device.locked === true);
    await this.thietBiRepository.delete({ id });
    return { message: `Equipment ${id} deleted` };
  }

  async removeMany(ids: number[]): Promise<{ message: string }> {
    const devices = await this.thietBiRepository.findBy({ id: In(ids) });
    if (devices.some((device) => device.locked === true)) {
      throw new ConflictException("Locked equipment cannot be deleted");
    }
    await this.assertRemovable(ids);
    const result = await this.thietBiRepository.delete({ id: In(ids) });
    return { message: `Deleted ${result.affected ?? 0} equipment records` };
  }

  private async assertRemovable(ids: number[], isLocked = false) {
    if (isLocked) throw new ConflictException("Locked equipment cannot be deleted");
    const [specifications, workflows] = await Promise.all([
      this.specificationRepository.countBy({ thiet_bi_id: In(ids) }),
      this.workflowRepository.countBy({ thiet_bi_id: In(ids) }),
    ]);
    if (specifications || workflows) {
      throw new ConflictException(
        "Equipment with specifications or workflow history cannot be deleted",
      );
    }
  }

  private toApi(device: ThietBi): ThietBi {
    if (!device.ten_thiet_bi) device.ten_thiet_bi = device.name;
    return device;
  }

  private async assertReferences(dto: CreateThietBiDto | UpdateThietBiDto) {
    const refs = [
      [dto.loai_thiet_bi_id, this.deviceTypeRepository, "loai_thiet_bi_id"],
      [dto.don_vi_tinh_id, this.unitRepository, "don_vi_tinh_id"],
      [dto.don_vi_id, this.organizationRepository, "don_vi_id"],
      [
        dto.phong_chu_quan_id,
        this.organizationRepository,
        "phong_chu_quan_id",
      ],
      [dto.don_vi_nhan_id, this.organizationRepository, "don_vi_nhan_id"],
      [dto.khu_vuc_id, this.areaRepository, "khu_vuc_id"],
      [dto.vi_tri_lap_dat_id, this.locationRepository, "vi_tri_lap_dat_id"],
      [
        dto.trang_thai_thiet_bi_id,
        this.statusRepository,
        "trang_thai_thiet_bi_id",
      ],
    ] as const;
    for (const [id, repository, field] of refs) {
      if (
        id !== undefined &&
        id !== null &&
        !(await repository.exist({ where: { id } }))
      ) {
        throw new BadRequestException(
          `${field} does not reference an existing record`,
        );
      }
    }
  }
}
