import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type WorkflowKind = "handover" | "receipt" | "move" | "status";
export type WorkflowState = "pending" | "approved" | "reversed";

@Entity("device_workflows")
export class DeviceWorkflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 20 })
  type: WorkflowKind;

  @Column({ type: "int" })
  thiet_bi_id: number;

  @Column({ type: "int", nullable: true })
  nguoi_nhan_id: number | null;

  @Column({ type: "int", nullable: true })
  vi_tri_lap_dat_id: number | null;

  @Column({ type: "int", nullable: true })
  trang_thai_thiet_bi_id: number | null;

  @Column({ type: "int", nullable: true })
  ban_giao_id: number | null;

  @Column({ type: "date", nullable: true })
  ngay_tiep_nhan: string | null;

  @Column({ type: "date", nullable: true })
  ngay_quyet_dinh: string | null;

  @Column({ type: "int", nullable: true })
  don_vi_lap_id: number | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  so_quyet_dinh: string | null;

  @Column({ type: "int", nullable: true })
  don_vi_giao_id: number | null;

  @Column({ type: "int", nullable: true })
  don_vi_nhan_id: number | null;

  @Column({ type: "int", nullable: true })
  don_vi_id: number | null;

  @Column({ type: "date", nullable: true })
  ngay_chung_tu: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  so_chung_tu: string | null;

  @Column({ type: "date", nullable: true })
  ngay_ap_dung: string | null;

  @Column({ type: "text", nullable: true })
  noi_dung: string | null;

  @Column({ type: "datetime" })
  effectiveAt: Date;

  @Column({ type: "text", nullable: true })
  ghi_chu: string | null;

  @Column({ type: "varchar", length: 20, default: "approved" })
  state: WorkflowState;

  @Column({ type: "json", nullable: true })
  beforeState: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  afterState: Record<string, unknown> | null;

  @Column({ type: "datetime", nullable: true })
  approvedAt: Date | null;

  @Column({ type: "datetime", nullable: true })
  reversedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
