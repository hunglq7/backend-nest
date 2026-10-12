import {
  BadRequestException,
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
    const allRows = await this.specs.find({
      where: { thiet_bi_id: deviceId },
      order: { id: "ASC" },
    });
    const rowsById = new Map(allRows.map((row) => [row.id, row]));
    const matches = query.search
      ? await this.specs.find({
          where: [
            { thiet_bi_id: deviceId, ma_thong_so: Like(`%${query.search}%`) },
            { thiet_bi_id: deviceId, ten_thong_so: Like(`%${query.search}%`) },
            { thiet_bi_id: deviceId, gia_tri: Like(`%${query.search}%`) },
          ],
          order: { id: "ASC" },
        })
      : allRows;
    const matchingRootIds = new Set<number>();
    matches.forEach((match) => {
      let current = match;
      const visited = new Set<number>();
      while (current.cap_tren_id !== null) {
        if (visited.has(current.id)) break;
        visited.add(current.id);
        const parent = rowsById.get(current.cap_tren_id);
        if (!parent) break;
        current = parent;
      }
      matchingRootIds.add(current.id);
    });
    const roots = allRows.filter(
      (row) =>
        (row.cap_tren_id === null || !rowsById.has(row.cap_tren_id)) &&
        matchingRootIds.has(row.id),
    );
    const total = roots.length;
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const pageRoots = roots.slice((page - 1) * query.limit, page * query.limit);
    const pageData: ThongSoKyThuat[] = [];
    const childrenByParent = new Map<number, ThongSoKyThuat[]>();
    allRows.forEach((row) => {
      if (row.cap_tren_id === null) return;
      const children = childrenByParent.get(row.cap_tren_id) ?? [];
      children.push(row);
      childrenByParent.set(row.cap_tren_id, children);
    });
    const includedIds = new Set<number>();
    const appendTree = (row: ThongSoKyThuat) => {
      if (includedIds.has(row.id)) return;
      includedIds.add(row.id);
      pageData.push(row);
      (childrenByParent.get(row.id) ?? []).forEach(appendTree);
    };
    pageRoots.forEach(appendTree);
    for (const row of pageData) row.ma_thiet_bi = device.ma_thiet_bi;
    await this.includeParentNames(pageData);
    return { data: pageData, total, page, limit: query.limit, totalPages };
  }

  async create(deviceId: number, dto: CreateThongSoKyThuatDto) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    if (dto.cap_tren_id !== undefined && dto.cap_tren_id !== null) {
      await this.assertParent(deviceId, dto.cap_tren_id);
    }
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
    await this.includeParentNames([row]);
    return row;
  }

  async update(deviceId: number, specId: number, dto: UpdateThongSoKyThuatDto) {
    const device = await this.assertDevice(deviceId);
    this.assertDeviceUnlocked(device);
    const row = await this.findSpecification(deviceId, specId);
    if (row.locked && !(dto.locked === false && Object.keys(dto).length === 1)) {
      throw new ConflictException("Locked specifications cannot be edited");
    }
    if (dto.cap_tren_id !== undefined && dto.cap_tren_id !== null) {
      await this.assertParent(deviceId, dto.cap_tren_id, specId);
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

  private async assertParent(
    deviceId: number,
    parentId: number,
    specificationId?: number,
  ) {
    let currentId: number | null = parentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === specificationId) {
        throw new BadRequestException(
          "A specification cannot be its own parent or an ancestor of its parent",
        );
      }
      if (visited.has(currentId)) {
        throw new BadRequestException("The parent specification hierarchy is invalid");
      }
      visited.add(currentId);

      const current = await this.specs.findOne({
        select: { id: true, cap_tren_id: true },
        where: { id: currentId, thiet_bi_id: deviceId },
      });
      if (!current) {
        throw new BadRequestException(
          "The parent specification must belong to the same equipment",
        );
      }
      currentId = current.cap_tren_id;
    }
  }

  private async includeParentNames(rows: ThongSoKyThuat[]) {
    const parentIds = Array.from(
      new Set(
        rows
          .map((row) => row.cap_tren_id)
          .filter((id): id is number => id !== null && id !== undefined),
      ),
    );
    if (parentIds.length === 0) {
      rows.forEach((row) => {
        row.cap_tren_ten_thong_so = null;
      });
      return;
    }

    const parents = await this.specs.find({
      select: { id: true, ten_thong_so: true },
      where: { id: In(parentIds) },
    });
    const names = new Map(parents.map((parent) => [parent.id, parent.ten_thong_so]));
    rows.forEach((row) => {
      row.cap_tren_ten_thong_so = row.cap_tren_id
        ? names.get(row.cap_tren_id) ?? null
        : null;
    });
  }
}
