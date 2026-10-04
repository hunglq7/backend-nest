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
  @Column({ type: "varchar", length: 255 })
  name: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
