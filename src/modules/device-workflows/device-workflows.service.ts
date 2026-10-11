import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  In,
  Like,
  MoreThan,
  Repository,
} from "typeorm";
import {
  HandoverQueryDto,
  MoveQueryDto,
  PaginationQueryDto,
} from "../../common/dto/pagination-query.dto";
import { DonVi } from "../don_vi/entities/don_vi.entity";
import { Users } from "../users/entities/user.entity";
import { ThietBi } from "../thiet_bi/entities/thiet_bi.entity";
import { ViTriLapDat } from "../vi_tri_lap_dat/entities/vi_tri_lap_dat.entity";
import { TrangThaiThietBi } from "../device-catalogs/entities/trang-thai-thiet-bi.entity";
import { HandoverDto } from "./dto/handover.dto";
import { MoveDto } from "./dto/move.dto";
import { ReceiptDto } from "./dto/receipt.dto";
import { StatusUpdateDto } from "./dto/status-update.dto";
import { DeviceWorkflow, WorkflowKind } from "./entities/device-workflow.entity";

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isNullableDate(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

@Injectable()
export class DeviceWorkflowsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DeviceWorkflow)
    private readonly workflows: Repository<DeviceWorkflow>,
  ) {}

  async findAll(
    type: WorkflowKind,
    query: PaginationQueryDto | HandoverQueryDto | MoveQueryDto,
  ) {
    if (type === "handover") {
      return this.findHandovers(query as HandoverQueryDto);
    }
    if (type === "move") {
      return this.findMoves(query as MoveQueryDto);
    }
    const where = query.search
      ? [
          { type, ghi_chu: Like(`%${query.search}%`) },
          { type, noi_dung: Like(`%${query.search}%`) },
          { type, so_chung_tu: Like(`%${query.search}%`) },
          { type, so_quyet_dinh: Like(`%${query.search}%`) },
        ]
      : { type };
    const [data, total] = await this.workflows.findAndCount({
      where,
      order: { id: "DESC" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const pageData =
      page === query.page
        ? data
        : await this.workflows.find({
            where,
            order: { id: "DESC" },
            skip: (page - 1) * query.limit,
            take: query.limit,
          });
    return { data: pageData, total, page, limit: query.limit, totalPages };
  }

  private async findMoves(query: MoveQueryDto) {
    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      throw new BadRequestException("dateFrom must be before or equal to dateTo");
    }
    const builder = this.workflows
      .createQueryBuilder("workflow")
      .where("workflow.type = :type", { type: "move" });
    if (query.dateFrom) {
      builder.andWhere("workflow.ngay_chung_tu >= :dateFrom", {
        dateFrom: query.dateFrom,
      });
    }
    if (query.dateTo) {
      builder.andWhere(
        "workflow.ngay_chung_tu < DATE_ADD(:dateTo, INTERVAL 1 DAY)",
        { dateTo: query.dateTo },
      );
    }
    if (query.don_vi_id) {
      builder.andWhere("workflow.don_vi_id = :organizationId", {
        organizationId: query.don_vi_id,
      });
    }
    if (query.search) {
      builder.andWhere(
        "(workflow.so_chung_tu LIKE :search OR workflow.noi_dung LIKE :search OR workflow.ghi_chu LIKE :search)",
        { search: `%${query.search}%` },
      );
    }
    const total = await builder.getCount();
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const rows = await builder
      .orderBy("workflow.id", "DESC")
      .skip((page - 1) * query.limit)
      .take(query.limit)
      .getMany();
    const data = rows.length ? await this.addDeviceDisplayFields(rows) : rows;
    return { data, total, page, limit: query.limit, totalPages };
  }

  private async addDeviceDisplayFields(rows: DeviceWorkflow[]) {
    const devices = await this.dataSource.getRepository(ThietBi).find({
      where: { id: In(rows.map((row) => row.thiet_bi_id)) },
      select: ["id", "ma_thiet_bi", "ten_thiet_bi", "name"],
    });
    const deviceById = new Map(devices.map((device) => [device.id, device]));
    return rows.map((row) => ({
      ...row,
      deviceCode: deviceById.get(row.thiet_bi_id)?.ma_thiet_bi ?? "",
      deviceName:
        deviceById.get(row.thiet_bi_id)?.ten_thiet_bi ??
        deviceById.get(row.thiet_bi_id)?.name ??
        "",
    }));
  }

  async findReceivableHandovers(query: HandoverQueryDto) {
    const builder = this.workflows
      .createQueryBuilder("workflow")
      .where("workflow.type = :type", { type: "handover" })
      .andWhere("workflow.state = :state", { state: "approved" });
    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      throw new BadRequestException("dateFrom must be before or equal to dateTo");
    }
    if (query.dateFrom) {
      builder.andWhere("workflow.ngay_quyet_dinh >= :dateFrom", {
        dateFrom: query.dateFrom,
      });
    }
    if (query.dateTo) {
      builder.andWhere(
        "workflow.ngay_quyet_dinh < DATE_ADD(:dateTo, INTERVAL 1 DAY)",
        { dateTo: query.dateTo },
      );
    }
    if (query.don_vi_lap_id) {
      builder.andWhere("workflow.don_vi_lap_id = :organizationId", {
        organizationId: query.don_vi_lap_id,
      });
    }
    if (query.search) {
      builder.andWhere(
        "(workflow.ghi_chu LIKE :search OR workflow.noi_dung LIKE :search OR workflow.so_quyet_dinh LIKE :search)",
        { search: `%${query.search}%` },
      );
    }
    const total = await builder.getCount();
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const rows = await builder
      .orderBy("workflow.id", "DESC")
      .skip((page - 1) * query.limit)
      .take(query.limit)
      .getMany();
    const data = rows.length ? await this.addReceiptStatus(rows) : rows;
    return { data, total, page, limit: query.limit, totalPages };
  }

  private async findHandovers(query: HandoverQueryDto) {
    const today = new Date().toISOString().slice(0, 10);
    const dateFrom = query.dateFrom ?? today;
    const dateTo = query.dateTo ?? today;
    if (dateFrom > dateTo) {
      throw new BadRequestException("dateFrom must be before or equal to dateTo");
    }
    const builder = this.workflows
      .createQueryBuilder("workflow")
      .where("workflow.type = :type", { type: "handover" })
      .andWhere("workflow.ngay_quyet_dinh >= :dateFrom", { dateFrom })
      .andWhere(
        "workflow.ngay_quyet_dinh < DATE_ADD(:dateTo, INTERVAL 1 DAY)",
        { dateTo },
      );
    if (query.don_vi_lap_id) {
      builder.andWhere("workflow.don_vi_lap_id = :organizationId", {
        organizationId: query.don_vi_lap_id,
      });
    }
    if (query.search) {
      builder.andWhere(
        "(workflow.ghi_chu LIKE :search OR workflow.noi_dung LIKE :search OR workflow.so_quyet_dinh LIKE :search)",
        { search: `%${query.search}%` },
      );
    }
    const total = await builder.getCount();
    const totalPages = Math.ceil(total / query.limit);
    const page = totalPages ? Math.min(query.page, totalPages) : 1;
    const rows = await builder
      .orderBy("workflow.id", "DESC")
      .skip((page - 1) * query.limit)
      .take(query.limit)
      .getMany();
    const data = rows.length ? await this.addReceiptStatus(rows) : rows;
    return { data, total, page, limit: query.limit, totalPages };
  }

  private async addReceiptStatus(rows: DeviceWorkflow[]) {
    const [approvedReceipts, devices] = await Promise.all([
      this.workflows.find({
        where: {
          type: "receipt",
          ban_giao_id: In(rows.map((row) => row.id)),
          state: "approved",
        },
        select: ["ban_giao_id"],
      }),
      this.dataSource.getRepository(ThietBi).find({
        where: { id: In(rows.map((row) => row.thiet_bi_id)) },
        select: ["id", "ma_thiet_bi", "ten_thiet_bi", "name"],
      }),
    ]);
    const receivedHandoverIds = new Set(
      approvedReceipts
        .map((receipt) => receipt.ban_giao_id)
        .filter((id): id is number => id !== null),
    );
    const deviceById = new Map(devices.map((device) => [device.id, device]));
    return rows.map((row) => ({
      ...row,
      received: receivedHandoverIds.has(row.id),
      deviceCode: deviceById.get(row.thiet_bi_id)?.ma_thiet_bi ?? "",
      deviceName:
        deviceById.get(row.thiet_bi_id)?.ten_thiet_bi ??
        deviceById.get(row.thiet_bi_id)?.name ??
        "",
    }));
  }

  async handover(dto: HandoverDto) {
    return this.dataSource.transaction(async (manager) => {
      const device = await this.device(manager, dto.thiet_bi_id, true);
      this.assertUnlocked(device);
      await this.organization(manager, dto.don_vi_lap_id);
      await this.organization(manager, dto.don_vi_giao_id);
      await this.organization(manager, dto.don_vi_nhan_id);
      if (dto.nguoi_nhan_id) await this.user(manager, dto.nguoi_nhan_id);

      const beforeState = this.deviceSnapshot(device);
      if (dto.nguoi_nhan_id !== undefined) {
        device.nguoi_nhan_id = dto.nguoi_nhan_id;
      }
      await manager.save(device);

      const decisionDate = dto.ngay_quyet_dinh ?? dto.ngay_ban_giao;
      return manager.save(
        manager.create(DeviceWorkflow, {
          type: "handover",
          thiet_bi_id: device.id,
          nguoi_nhan_id: dto.nguoi_nhan_id ?? null,
          don_vi_lap_id: dto.don_vi_lap_id ?? null,
          so_quyet_dinh: dto.so_quyet_dinh ?? null,
          don_vi_giao_id: dto.don_vi_giao_id ?? null,
          don_vi_nhan_id: dto.don_vi_nhan_id ?? null,
          ngay_quyet_dinh: decisionDate ?? null,
          ngay_tiep_nhan: dto.ngay_tiep_nhan ?? null,
          noi_dung: dto.noi_dung ?? null,
          effectiveAt: this.date(decisionDate),
          ghi_chu: dto.ghi_chu ?? null,
          state: "approved",
          beforeState,
          afterState: this.deviceSnapshot(device),
          approvedAt: new Date(),
        }),
      );
    });
  }

  async updateHandover(id: number, dto: HandoverDto) {
    return this.dataSource.transaction(async (manager) => {
      const handover = await this.workflow(manager, id, "handover", true);
      const repository = manager.getRepository(DeviceWorkflow);
      const hasActiveReceipt = await repository.exist({
        where: { type: "receipt", ban_giao_id: id, state: "approved" },
      });
      const laterWorkflows = await repository.find({
        where: {
          thiet_bi_id: handover.thiet_bi_id,
          id: MoreThan(id),
        },
        select: ["id", "type", "state", "ban_giao_id"],
      });
      const hasLaterWorkflow = laterWorkflows.some(
        (workflow) =>
          !(
            workflow.type === "receipt" &&
            workflow.state !== "approved" &&
            workflow.ban_giao_id === handover.id
          ),
      );
      if (hasActiveReceipt || hasLaterWorkflow || handover.state !== "approved") {
        throw new ConflictException(
          "A received handover or one with later workflow history cannot be edited",
        );
      }
      if (dto.thiet_bi_id !== handover.thiet_bi_id) {
        throw new ConflictException("The equipment on a handover cannot be changed");
      }
      await this.organization(manager, dto.don_vi_lap_id);
      await this.organization(manager, dto.don_vi_giao_id);
      await this.organization(manager, dto.don_vi_nhan_id);
      if (dto.nguoi_nhan_id) await this.user(manager, dto.nguoi_nhan_id);
      const device = await this.device(manager, handover.thiet_bi_id, true);
      this.assertUnlocked(device);
      if (!handover.afterState || !this.matchesSnapshot(device, handover.afterState)) {
        throw new ConflictException(
          "Equipment has changed since handover; this handover cannot be edited",
        );
      }
      Object.assign(handover, {
        don_vi_lap_id: dto.don_vi_lap_id ?? null,
        ngay_quyet_dinh: dto.ngay_quyet_dinh ?? dto.ngay_ban_giao ?? null,
        so_quyet_dinh: dto.so_quyet_dinh ?? null,
        don_vi_giao_id: dto.don_vi_giao_id ?? null,
        don_vi_nhan_id: dto.don_vi_nhan_id ?? null,
        nguoi_nhan_id: dto.nguoi_nhan_id ?? null,
        ngay_tiep_nhan: dto.ngay_tiep_nhan ?? null,
        noi_dung: dto.noi_dung ?? null,
        ghi_chu: dto.ghi_chu ?? null,
        effectiveAt: this.date(dto.ngay_quyet_dinh ?? dto.ngay_ban_giao),
        afterState: this.deviceSnapshot(device),
      });
      return manager.save(handover);
    });
  }

  async removeHandovers(ids: number[]) {
    if (!ids.length || ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
      throw new BadRequestException(
        "A non-empty list of valid handover IDs is required",
      );
    }
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(DeviceWorkflow);
      const handovers = await repository.find({
        where: { id: In(ids), type: "handover" },
        lock: { mode: "pessimistic_write" },
      });
      if (handovers.length !== new Set(ids).size) {
        throw new NotFoundException("One or more handovers were not found");
      }
      const selectedHandoverIds = new Set(handovers.map(({ id }) => id));
      const orderedHandovers = [...handovers].sort((a, b) => b.id - a.id);
      for (const handover of orderedHandovers) {
        const receipts = await repository.find({
          where: { type: "receipt", ban_giao_id: handover.id },
        });
        if (receipts.some((receipt) => receipt.state !== "reversed")) {
          throw new ConflictException(
            `Handover ${handover.id} has a receipt that must be cancelled before deletion`,
          );
        }
        const laterWorkflows = await repository.find({
          where: {
            thiet_bi_id: handover.thiet_bi_id,
            id: MoreThan(handover.id),
          },
          select: ["id", "type", "state", "ban_giao_id"],
        });
        const hasLaterWorkflow = laterWorkflows.some(
          (workflow) =>
            !selectedHandoverIds.has(workflow.id) &&
            !(
              workflow.type === "receipt" &&
              (workflow.state === "reversed" ||
                (workflow.ban_giao_id !== null &&
                  selectedHandoverIds.has(workflow.ban_giao_id)))
            ),
        );
        if (handover.state !== "approved") {
          throw new ConflictException(
            `Handover ${handover.id} is not active and cannot be deleted`,
          );
        }
        if (!hasLaterWorkflow) {
          if (!handover.beforeState || !handover.afterState) {
            throw new ConflictException(
              `Handover ${handover.id} has no safe rollback snapshot`,
            );
          }
          const device = await this.device(manager, handover.thiet_bi_id, true);
          this.assertUnlocked(device);
          if (!this.matchesSnapshot(device, handover.afterState)) {
            throw new ConflictException(
              `Equipment for handover ${handover.id} has changed; deletion would overwrite newer data`,
            );
          }
          this.restoreSnapshot(device, handover.beforeState);
          await manager.save(device);
        }
      }
      const reversedReceipts = await repository.find({
        where: {
          type: "receipt",
          ban_giao_id: In([...selectedHandoverIds]),
          state: "reversed",
        },
      });
      if (reversedReceipts.length) {
        await repository.remove(reversedReceipts);
      }
      await repository.remove(handovers);
      return { message: `Deleted ${handovers.length} handover record(s)` };
    });
  }

  async receive(dto: ReceiptDto) {
    return this.dataSource.transaction(async (manager) => {
      let handover: DeviceWorkflow | null = null;
      if (dto.ban_giao_id) {
        handover = await this.workflow(manager, dto.ban_giao_id, "handover", true);
      } else if (dto.thiet_bi_id) {
        handover = await manager.getRepository(DeviceWorkflow).findOne({
          where: { type: "handover", thiet_bi_id: dto.thiet_bi_id },
          order: { id: "DESC" },
          lock: { mode: "pessimistic_write" },
        });
      }
      if (!handover) {
        throw new NotFoundException(
          "A matching handover is required to create a receipt",
        );
      }
      if (handover.state !== "approved") {
        throw new ConflictException("Only an active handover can be received");
      }
      const activeReceipt = await manager.getRepository(DeviceWorkflow).findOne({
        where: { type: "receipt", ban_giao_id: handover.id },
      });
      if (activeReceipt && activeReceipt.state !== "reversed") {
        throw new ConflictException("This handover already has a receipt");
      }
      const device = await this.device(manager, handover.thiet_bi_id, true);
      this.assertUnlocked(device);
      const receivedAt = dto.ngay_tiep_nhan ?? handover.ngay_tiep_nhan;
      return manager.save(
        manager.create(DeviceWorkflow, {
          type: "receipt",
          ban_giao_id: handover.id,
          thiet_bi_id: handover.thiet_bi_id,
          ngay_tiep_nhan: receivedAt ?? null,
          effectiveAt: this.date(receivedAt),
          noi_dung: dto.noi_dung ?? null,
          ghi_chu: dto.ghi_chu ?? null,
          state: "pending",
        }),
      );
    });
  }

  async approveReceipt(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const receipt = await this.workflow(manager, id, "receipt", true);
      if (receipt.state !== "pending") {
        throw new ConflictException("Only a pending receipt can be approved");
      }
      if (!receipt.ban_giao_id) {
        throw new ConflictException("Receipt is not linked to a handover");
      }
      const handover = await this.workflow(
        manager,
        receipt.ban_giao_id,
        "handover",
        true,
      );
      const device = await this.device(manager, handover.thiet_bi_id, true);
      this.assertUnlocked(device);
      if (!handover.don_vi_nhan_id) {
        throw new BadRequestException(
          "A receiving organization is required to receive this equipment",
        );
      }
      await this.organization(manager, handover.don_vi_nhan_id);
      const receivedAt =
        receipt.ngay_tiep_nhan ??
        handover.ngay_tiep_nhan ??
        new Date().toISOString().slice(0, 10);
      receipt.beforeState = {
        ...this.deviceSnapshot(device),
        ngay_dua_vao_su_dung: device.ngay_dua_vao_su_dung,
      };
      device.don_vi_id = handover.don_vi_nhan_id;
      device.don_vi_nhan_id = handover.don_vi_nhan_id;
      device.ngay_dua_vao_su_dung = receivedAt;
      await manager.save(device);
      receipt.afterState = {
        ...this.deviceSnapshot(device),
        ngay_dua_vao_su_dung: device.ngay_dua_vao_su_dung,
      };
      receipt.state = "approved";
      receipt.approvedAt = new Date();
      receipt.ngay_tiep_nhan = receivedAt;
      handover.ngay_tiep_nhan = receivedAt;
      return manager.save([handover, receipt]);
    });
  }

  async receiveHandover(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const handover = await this.workflow(manager, id, "handover", true);
      if (handover.state !== "approved") {
        throw new ConflictException("Only an active handover can be received");
      }
      if (!handover.don_vi_nhan_id) {
        throw new BadRequestException(
          "A receiving organization is required to receive this equipment",
        );
      }
      await this.organization(manager, handover.don_vi_nhan_id);

      const receiptRepository = manager.getRepository(DeviceWorkflow);
      const existingReceipt = await receiptRepository.findOne({
        where: { type: "receipt", ban_giao_id: handover.id },
        order: { id: "DESC" },
        lock: { mode: "pessimistic_write" },
      });
      if (existingReceipt?.state === "approved") {
        throw new ConflictException("This handover has already been received");
      }

      const device = await this.device(manager, handover.thiet_bi_id, true);
      this.assertUnlocked(device);
      const receivedAt =
        handover.ngay_tiep_nhan ?? new Date().toISOString().slice(0, 10);
      const beforeState = {
        ...this.deviceSnapshot(device),
        ngay_dua_vao_su_dung: device.ngay_dua_vao_su_dung,
      };
      device.don_vi_id = handover.don_vi_nhan_id;
      device.don_vi_nhan_id = handover.don_vi_nhan_id;
      device.ngay_dua_vao_su_dung = receivedAt;
      await manager.save(device);

      const receipt =
        existingReceipt?.state === "pending"
          ? existingReceipt
          : receiptRepository.create({
              type: "receipt",
              ban_giao_id: handover.id,
              thiet_bi_id: handover.thiet_bi_id,
            });
      receipt.ngay_tiep_nhan = receivedAt;
      receipt.effectiveAt = this.date(receivedAt);
      receipt.beforeState = beforeState;
      receipt.afterState = {
        ...this.deviceSnapshot(device),
        ngay_dua_vao_su_dung: device.ngay_dua_vao_su_dung,
      };
      receipt.state = "approved";
      receipt.approvedAt = new Date();
      handover.ngay_tiep_nhan = receivedAt;

      await manager.save([handover, receipt]);
      return { message: "Đã tiếp nhận thiết bị thành công" };
    });
  }

  async reverseReceipt(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const receipt = await this.workflow(manager, id, "receipt", true);
      if (
        receipt.state !== "approved" ||
        !receipt.ban_giao_id ||
        !receipt.beforeState ||
        !receipt.afterState
      ) {
        throw new ConflictException("Only an approved linked receipt can be reversed");
      }
      const handover = await this.workflow(
        manager,
        receipt.ban_giao_id,
        "handover",
        true,
      );
      const device = await this.device(manager, handover.thiet_bi_id, true);
      this.assertUnlocked(device);
      const organizationFields = ["don_vi_id", "don_vi_nhan_id"] as const;
      const organizationIsUnchanged = organizationFields.every(
        (field) => device[field] === receipt.afterState?.[field],
      );
      if (!organizationIsUnchanged) {
        throw new ConflictException(
          "The equipment organization changed after receipt; reverse would overwrite newer data",
        );
      }
      const previousOrganizationId = receipt.beforeState.don_vi_id;
      const previousReceivingOrganizationId =
        receipt.beforeState.don_vi_nhan_id;
      if (
        !isNullableNumber(previousOrganizationId) ||
        !isNullableNumber(previousReceivingOrganizationId)
      ) {
        throw new ConflictException(
          "Receipt has no safe organization snapshot for cancellation",
        );
      }
      device.don_vi_id = previousOrganizationId;
      device.don_vi_nhan_id = previousReceivingOrganizationId;
      if ("ngay_dua_vao_su_dung" in receipt.afterState) {
        const receivedUsageDate = receipt.afterState.ngay_dua_vao_su_dung;
        const previousUsageDate = receipt.beforeState.ngay_dua_vao_su_dung;
        if (
          !isNullableDate(receivedUsageDate) ||
          !isNullableDate(previousUsageDate) ||
          device.ngay_dua_vao_su_dung !== receivedUsageDate
        ) {
          throw new ConflictException(
            "The equipment usage date changed after receipt; reverse would overwrite newer data",
          );
        }
        device.ngay_dua_vao_su_dung = previousUsageDate;
      }
      await manager.save(device);
      receipt.state = "reversed";
      receipt.reversedAt = new Date();
      await manager.save([handover, receipt]);
      return receipt;
    });
  }

  async reverseHandoverReceipt(handoverId: number) {
    const receipt = await this.workflows.findOne({
      where: {
        type: "receipt",
        ban_giao_id: handoverId,
        state: "approved",
      },
      order: { id: "DESC" },
    });
    if (!receipt) {
      throw new NotFoundException("No active receipt was found for this handover");
    }
    return this.reverseReceipt(receipt.id);
  }

  async move(dto: MoveDto) {
    return this.dataSource.transaction(async (manager) => {
      const device = await this.device(manager, dto.thiet_bi_id, true);
      this.assertUnlocked(device);
      await this.organization(manager, dto.don_vi_id);
      await this.location(manager, dto.vi_tri_lap_dat_id);
      const beforeState = this.deviceSnapshot(device);
      device.vi_tri_lap_dat_id = dto.vi_tri_lap_dat_id;
      if (dto.don_vi_id !== undefined) device.don_vi_id = dto.don_vi_id;
      await manager.save(device);
      const effectiveAt = dto.ngay_ap_dung ?? dto.ngay_di_chuyen;
      return manager.save(
        manager.create(DeviceWorkflow, {
          type: "move",
          thiet_bi_id: device.id,
          don_vi_id: dto.don_vi_id ?? null,
          vi_tri_lap_dat_id: dto.vi_tri_lap_dat_id,
          ngay_chung_tu: dto.ngay_chung_tu ?? null,
          so_chung_tu: dto.so_chung_tu ?? null,
          ngay_ap_dung: effectiveAt ?? null,
          noi_dung: dto.noi_dung ?? null,
          effectiveAt: this.date(effectiveAt),
          ghi_chu: dto.ghi_chu ?? null,
          state: "approved",
          beforeState,
          afterState: this.deviceSnapshot(device),
          approvedAt: new Date(),
        }),
      );
    });
  }

  async updateMove(id: number, dto: MoveDto) {
    return this.dataSource.transaction(async (manager) => {
      const move = await this.workflow(manager, id, "move", true);
      if (move.state !== "approved") {
        throw new ConflictException("Only an active equipment move can be edited");
      }
      if (dto.thiet_bi_id !== move.thiet_bi_id) {
        throw new ConflictException(
          "The equipment on a move cannot be changed",
        );
      }
      const repository = manager.getRepository(DeviceWorkflow);
      const hasLaterWorkflow = await repository.exist({
        where: {
          thiet_bi_id: move.thiet_bi_id,
          id: MoreThan(move.id),
        },
      });
      if (hasLaterWorkflow) {
        throw new ConflictException(
          "A move with later equipment workflow history cannot be edited",
        );
      }
      const organizationId = dto.don_vi_id ?? move.don_vi_id;
      await this.organization(manager, organizationId);
      await this.location(manager, dto.vi_tri_lap_dat_id);

      const device = await this.device(manager, move.thiet_bi_id, true);
      this.assertUnlocked(device);
      if (!move.beforeState || !move.afterState) {
        throw new ConflictException("Move has no safe equipment snapshot");
      }
      if (!this.matchesSnapshot(device, move.afterState)) {
        throw new ConflictException(
          "Equipment has changed since this move; this move cannot be edited",
        );
      }

      device.vi_tri_lap_dat_id = dto.vi_tri_lap_dat_id;
      device.don_vi_id = organizationId ?? null;
      await manager.save(device);

      Object.assign(move, {
        don_vi_id: organizationId ?? null,
        ngay_chung_tu: dto.ngay_chung_tu ?? dto.ngay_di_chuyen ?? null,
        so_chung_tu: dto.so_chung_tu ?? null,
        vi_tri_lap_dat_id: dto.vi_tri_lap_dat_id,
        ngay_ap_dung: dto.ngay_ap_dung ?? dto.ngay_di_chuyen ?? null,
        noi_dung: dto.noi_dung ?? null,
        ghi_chu: dto.ghi_chu ?? null,
        effectiveAt: this.date(dto.ngay_ap_dung ?? dto.ngay_di_chuyen),
        afterState: this.deviceSnapshot(device),
      });
      return manager.save(move);
    });
  }

  async removeMove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const move = await this.workflow(manager, id, "move", true);
      if (move.state !== "approved") {
        throw new ConflictException("Only an active equipment move can be deleted");
      }
      const hasLaterWorkflow = await manager
        .getRepository(DeviceWorkflow)
        .exist({
          where: {
            thiet_bi_id: move.thiet_bi_id,
            id: MoreThan(move.id),
          },
        });
      if (!hasLaterWorkflow) {
        if (!move.beforeState || !move.afterState) {
          throw new ConflictException("Move has no safe equipment snapshot");
        }

        const device = await this.device(manager, move.thiet_bi_id, true);
        this.assertUnlocked(device);
        if (!this.matchesSnapshot(device, move.afterState)) {
          throw new ConflictException(
            "Equipment has changed since this move; deletion would overwrite newer data",
          );
        }

        this.restoreSnapshot(device, move.beforeState);
        await manager.save(device);
      }
      await manager.remove(move);
      return { message: `Move ${id} deleted` };
    });
  }

  async updateStatus(dto: StatusUpdateDto) {
    return this.dataSource.transaction(async (manager) => {
      const device = await this.device(manager, dto.thiet_bi_id, true);
      this.assertUnlocked(device);
      await this.organization(manager, dto.don_vi_lap_id);
      await this.status(manager, dto.trang_thai_thiet_bi_id);
      const beforeState = this.deviceSnapshot(device);
      device.trang_thai_thiet_bi_id = dto.trang_thai_thiet_bi_id;
      await manager.save(device);
      const effectiveAt = dto.ngay_ap_dung ?? dto.ngay_cap_nhat;
      return manager.save(
        manager.create(DeviceWorkflow, {
          type: "status",
          thiet_bi_id: device.id,
          trang_thai_thiet_bi_id: dto.trang_thai_thiet_bi_id,
          don_vi_lap_id: dto.don_vi_lap_id ?? null,
          so_chung_tu: dto.so_chung_tu ?? null,
          ngay_chung_tu: dto.ngay_chung_tu ?? null,
          ngay_ap_dung: effectiveAt ?? null,
          noi_dung: dto.noi_dung ?? null,
          effectiveAt: this.date(effectiveAt),
          ghi_chu: dto.ghi_chu ?? null,
          state: "approved",
          beforeState,
          afterState: this.deviceSnapshot(device),
          approvedAt: new Date(),
        }),
      );
    });
  }

  private date(value?: string | null): Date {
    if (!value) return new Date();
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Date value is invalid");
    }
    return parsed;
  }

  private async device(manager: any, id: number, lock = false) {
    const device = await manager.getRepository(ThietBi).findOne({
      where: { id },
      ...(lock ? { lock: { mode: "pessimistic_write" } } : {}),
    });
    if (!device) throw new NotFoundException(`Equipment ${id} was not found`);
    return device as ThietBi;
  }

  private async workflow(
    manager: any,
    id: number,
    type: WorkflowKind,
    lock = false,
  ) {
    const workflow = await manager.getRepository(DeviceWorkflow).findOne({
      where: { id, type },
      ...(lock ? { lock: { mode: "pessimistic_write" } } : {}),
    });
    if (!workflow) throw new NotFoundException(`Workflow ${id} was not found`);
    return workflow as DeviceWorkflow;
  }

  private async user(manager: any, id: number) {
    if (!(await manager.getRepository(Users).exist({ where: { id } }))) {
      throw new NotFoundException(`User ${id} was not found`);
    }
  }

  private async organization(manager: any, id?: number | null) {
    if (
      id != null &&
      !(await manager.getRepository(DonVi).exist({ where: { id } }))
    ) {
      throw new NotFoundException(`Organization ${id} was not found`);
    }
  }

  private async location(manager: any, id: number) {
    if (!(await manager.getRepository(ViTriLapDat).exist({ where: { id } }))) {
      throw new NotFoundException(`Installation location ${id} was not found`);
    }
  }

  private async status(manager: any, id: number) {
    const status = await manager.getRepository(TrangThaiThietBi).findOneBy({ id });
    if (!status || !status.isActive) {
      throw new NotFoundException(`Active equipment status ${id} was not found`);
    }
  }

  private deviceSnapshot(device: ThietBi) {
    return {
      vi_tri_lap_dat_id: device.vi_tri_lap_dat_id,
      trang_thai_thiet_bi_id: device.trang_thai_thiet_bi_id,
      nguoi_nhan_id: device.nguoi_nhan_id,
      don_vi_id: device.don_vi_id,
      don_vi_nhan_id: device.don_vi_nhan_id,
    };
  }

  private assertUnlocked(device: ThietBi) {
    if (device.locked === true) {
      throw new ConflictException(
        "Locked equipment cannot be changed by a workflow",
      );
    }
  }

  private matchesSnapshot(
    device: ThietBi,
    snapshot: Record<string, unknown>,
  ): boolean {
    return Object.entries(snapshot).every(
      ([key, value]) => (device as any)[key] === value,
    );
  }

  private restoreSnapshot(device: ThietBi, snapshot: Record<string, unknown>) {
    for (const key of [
      "vi_tri_lap_dat_id",
      "trang_thai_thiet_bi_id",
      "nguoi_nhan_id",
      "don_vi_id",
      "don_vi_nhan_id",
    ]) {
      if (key in snapshot) (device as any)[key] = snapshot[key];
    }
  }
}
