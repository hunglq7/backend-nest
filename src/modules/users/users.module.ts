import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { RolesModule } from "../roles/roles.module";
import { UserRole } from "../roles/entities/user-role.entity";
import { AdminGuard } from "../roles/guards/admin.guard";
@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserRole]),
    AuthModule,
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AdminGuard],
})
export class UsersModule {}
