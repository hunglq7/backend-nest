import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("donvis")
@Unique("UQ_Ten_don_vi", ["ten_don_vi"])
export class DonVi {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "char", length: 3, unique: true })
  ma_don_vi: string;

  @Column({ type: "varchar", length: 255 })
  ten_don_vi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
