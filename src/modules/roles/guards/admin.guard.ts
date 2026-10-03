import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRole } from "../entities/user-role.entity";

interface AuthenticatedRequest {
  user?: { sub?: number };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException("Không có quyền truy cập");
    }

    const adminRole = await this.userRoleRepository
      .createQueryBuilder("userRole")
      .innerJoin("userRole.role", "role")
      .where("userRole.idUser = :userId", { userId })
      .andWhere("role.name = :roleName", { roleName: "admin" })
      .getOne();

    if (!adminRole) {
      throw new ForbiddenException("Chỉ quản trị viên mới được thực hiện thao tác này");
    }
    return true;
  }
}
