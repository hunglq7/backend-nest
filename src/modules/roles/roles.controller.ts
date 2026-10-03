import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AssignUserRoleDto } from "./dto/assign-user-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AdminGuard } from "./guards/admin.guard";
import { RolesService } from "./roles.service";

@Controller()
@UseGuards(AccessTokenGuard, AdminGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get("roles")
  findRoles() {
    return this.rolesService.findRoles();
  }

  @Post("roles")
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Patch("roles/:id")
  updateRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete("roles/:id")
  removeRole(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.removeRole(id);
  }

  @Get("user-roles")
  findAssignments() {
    return this.rolesService.findAssignments();
  }

  @Post("user-roles")
  assignUserRole(@Body() dto: AssignUserRoleDto) {
    return this.rolesService.assignUserRole(dto);
  }

  @Delete("user-roles/:id")
  removeAssignment(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.removeAssignment(id);
  }
}
