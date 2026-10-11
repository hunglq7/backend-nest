import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class CatalogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 64, unique: true })
  code: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", nullable: true })
  parent: number | null;

  @Column({ type: "boolean", default: false })
  locked: boolean;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
