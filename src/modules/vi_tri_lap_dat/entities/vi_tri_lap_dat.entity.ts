import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("vitrilapdats")
export class ViTriLapDat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "char", length: 7, unique: true, nullable: true })
  ma_vi_tri_lap_dat: string | null;

  @Column({ type: "varchar", length: 255 })
  ten_vi_tri: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
