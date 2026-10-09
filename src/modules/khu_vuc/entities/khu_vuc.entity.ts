import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("khuvucs")
export class KhuVuc {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "varchar", length: 255 })
  Tên_khu_vuc: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
