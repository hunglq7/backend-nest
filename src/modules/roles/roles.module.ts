import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { Users } from "../users/entities/user.entity";
import { Role } from "./entities/role.entity";
import { UserRole } from "./entities/user-role.entity";
import { AdminGuard } from "./guards/admin.guard";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole, Users]), AuthModule],
  controllers: [RolesController],
  providers: [RolesService, AdminGuard],
  exports: [RolesService, AdminGuard],
})
export class RolesModule {}
