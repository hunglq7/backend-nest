import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("thong_so_ky_thuat_thiet_bis")
export class ThongSoKyThuat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  thiet_bi_id: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  ma_thong_so: string | null;

  @Column({ type: "varchar", length: 255 })
  ten_thong_so: string;

  @Column({ type: "int", nullable: true })
  cap_tren_id: number | null;

  cap_tren_ten_thong_so?: string | null;

  @Column({ type: "text", nullable: true })
  gia_tri: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  don_vi_tinh: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  ma_thiet_bi: string | null;

  @Column({ type: "boolean", default: false })
  locked: boolean;

  @Column({ type: "text", nullable: true })
  ghi_chu: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
