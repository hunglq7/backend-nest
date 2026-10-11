import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("loaithietbis")
export class LoaiThietBi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "char", length: 2, unique: true, nullable: true })
  ma_loai_thiet_bi: string | null;

  @Column({ type: "varchar", length: 255 })
  loai_thiet_bi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
