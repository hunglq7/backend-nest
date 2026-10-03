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
  Query,
} from "@nestjs/common";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
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
  findRoles(@Query() query: PaginationQueryDto) {
    return this.rolesService.findRoles(query);
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
  findAssignments(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAssignments(query);
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
