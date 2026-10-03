import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from "typeorm";
import { Role } from "./role.entity";
import { Users } from "../../users/entities/user.entity";

@Entity("userrole")
@Unique(["idUser", "idRole"])
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idUser: number;

  @Column()
  idRole: number;

  @ManyToOne(() => Users, (user) => user.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idUser" })
  user: Users;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "idRole" })
  role: Role;
}
