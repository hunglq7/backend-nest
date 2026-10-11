import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("donvitinhs")
export class DonViTinh {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "char", length: 2, unique: true, nullable: true })
  ma_don_vi_tinh: string | null;

  @Column({ type: "varchar", length: 255, unique: true })
  ten_don_vi_tinh: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
