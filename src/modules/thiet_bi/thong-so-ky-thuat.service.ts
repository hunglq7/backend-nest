import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { CreateThongSoKyThuatDto } from "./dto/create-thong-so-ky-thuat.dto";
import { UpdateThongSoKyThuatDto } from "./dto/update-thong-so-ky-thuat.dto";
import { ThietBi } from "./entities/thiet_bi.entity";
import { ThongSoKyThuat } from "./entities/thong-so-ky-thuat.entity";

@Injectable()
export class ThongSoKyThuatService {
  constructor(
    @InjectRepository(ThietBi) private readonly devices: Repository<ThietBi>,
    @InjectRepository(ThongSoKyThuat)
    private readonly specs: Repository<ThongSoKyThuat>,
  ) {}

  async findAll(deviceId: number, query: PaginationQueryDto) {
    const device = await this.assertDevice(deviceId);
    const where = query.search
      ? [
          { thiet_bi_id: deviceId, ma_thong_so: Like(`%${query.search}%`) },
          { thiet_bi_id: deviceId, ten_thong_so: Like(`%${query.search}%`) },
          { thiet_bi_id: deviceId, gia_tri: Like(`%${query.search}%`) },
        ]
      : { thiet_bi_id: deviceId };
    const [data, total] = await this.specs.findAndCount({
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
        : await this.specs.find({
            where,
            order: { id: "ASC" },
            skip: (page - 1) * query.limit,
            take: query.limit,
          });
    for (const row of pageData) row.ma_thiet_bi = device.ma_thiet_bi;
    return { data: pageData, total, page, limit: query.limit, totalPages };
  }

  async create(deviceId: number, dto: CreateThongSoKyThuatDto) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    const { don_vi, ...spec } = dto;
    return this.specs.save(
      this.specs.create({
        ...spec,
        don_vi_tinh: dto.don_vi_tinh ?? don_vi ?? null,
        thiet_bi_id: deviceId,
        ma_thiet_bi: device.ma_thiet_bi,
      }),
    );
  }

  async findOne(deviceId: number, specId: number) {
    const device = await this.assertDevice(deviceId);
    const row = await this.findSpecification(deviceId, specId);
    row.ma_thiet_bi = device.ma_thiet_bi;
    return row;
  }

  async update(deviceId: number, specId: number, dto: UpdateThongSoKyThuatDto) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    const row = await this.findSpecification(deviceId, specId);
    if (row.locked && !(dto.locked === false && Object.keys(dto).length === 1)) {
      throw new ConflictException("Locked specifications cannot be edited");
    }
    const { don_vi, ...spec } = dto;
    Object.assign(row, spec);
    if (don_vi !== undefined) row.don_vi_tinh = don_vi;
    row.ma_thiet_bi = device.ma_thiet_bi;
    return this.specs.save(row);
  }

  async remove(deviceId: number, specId: number) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    const row = await this.findSpecification(deviceId, specId);
    if (row.locked) {
      throw new ConflictException("Locked specifications cannot be deleted");
    }
    await this.specs.remove(row);
    return { message: `Specification ${specId} deleted` };
  }

  async removeMany(deviceId: number, ids: number[]) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    const rows = await this.specs.findBy({
      id: In(ids),
      thiet_bi_id: deviceId,
    });
    if (rows.length !== new Set(ids).size) {
      throw new NotFoundException(
        "One or more specifications were not found for this equipment",
      );
    }
    if (rows.some((row) => row.locked)) {
      throw new ConflictException("Locked specifications cannot be deleted");
    }
    await this.specs.remove(rows);
    return { message: `Deleted ${rows.length} specification record(s)` };
  }

  private async assertDevice(id: number): Promise<ThietBi> {
    const device = await this.devices.findOneBy({ id });
    if (!device) throw new NotFoundException(`Equipment ${id} was not found`);
    return device;
  }

  private assertDeviceUnlocked(device: ThietBi) {
    if (device.locked === true) {
      throw new ConflictException(
        "Specifications on locked equipment cannot be changed",
      );
    }
  }

  private async findSpecification(deviceId: number, specId: number) {
    const row = await this.specs.findOneBy({ id: specId, thiet_bi_id: deviceId });
    if (!row) throw new NotFoundException(`Specification ${specId} was not found`);
    return row;
  }
}
