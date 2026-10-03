import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserRole } from "./user-role.entity";

@Entity("role")
@Unique(["name"])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
