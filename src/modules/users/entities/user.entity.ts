import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;

  @Column({ type: "varchar", length: 255, nullable: true, select: false })
  passwordHash: string;

  @Column({ type: "varchar", length: 255, nullable: true, select: false })
  refreshTokenHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
