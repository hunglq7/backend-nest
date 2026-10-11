import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("thietbis")
export class ThietBi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  ten_thiet_bi: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  ma_thiet_bi: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  so_quan_ly: string | null;

  @Column({ type: "text", nullable: true })
  nhiem_vu: string | null;

  @Column({ type: "int", nullable: true })
  don_vi_tinh_id: number | null;

  @Column({ type: "date", nullable: true })
  ngay_dua_vao_su_dung: string | null;

  @Column({ type: "varchar", length: 150, nullable: true })
  nuoc_san_xuat: string | null;

  @Column({ type: "int", nullable: true })
  loai_thiet_bi_id: number | null;

  @Column({ type: "int", nullable: true })
  don_vi_id: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  phong_chu_quan: string | null;

  @Column({ type: "int", nullable: true })
  phong_chu_quan_id: number | null;

  @Column({ type: "int", nullable: true })
  khu_vuc_id: number | null;

  @Column({ type: "int", nullable: true })
  vi_tri_lap_dat_id: number | null;

  @Column({ type: "boolean", nullable: true, default: false })
  tai_san: boolean | null;

  @Column({ type: "boolean", nullable: true, default: false })
  locked: boolean | null;

  @Column({ type: "text", nullable: true })
  ghi_chu: string | null;

  @Column({ type: "int", nullable: true })
  trang_thai_thiet_bi_id: number | null;

  @Column({ type: "int", nullable: true })
  nguoi_nhan_id: number | null;

  @Column({ type: "int", nullable: true })
  don_vi_nhan_id: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
