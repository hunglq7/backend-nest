import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { Users } from "../users/entities/user.entity";
import { AssignUserRoleDto } from "./dto/assign-user-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./entities/role.entity";
import { UserRole } from "./entities/user-role.entity";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

const INITIAL_ADMIN_EMAIL = "hunglq7@gmail.com";

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async onModuleInit() {
    for (const name of ["admin", "user"]) {
      const existingRole = await this.roleRepository.findOneBy({ name });
      if (!existingRole) {
        await this.roleRepository.save(this.roleRepository.create({ name }));
      }
    }

    const users = await this.userRepository.find();
    for (const user of users) {
      const roleName =
        user.email?.toLowerCase() === INITIAL_ADMIN_EMAIL ? "admin" : "user";
      await this.assignRoleIfMissing(user.id, roleName);
    }
  }

  async findRoles({ page, limit, search }: PaginationQueryDto) {
    const where = search ? { name: Like(`%${search}%`) } : undefined;
    const [data, total] = await this.roleRepository.findAndCount({
      where,
      order: { id: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const pageData =
      effectivePage === page
        ? data
        : await this.roleRepository.find({
            where,
            order: { id: "ASC" },
            skip: (effectivePage - 1) * limit,
            take: limit,
          });
    return { data: pageData, total, page: effectivePage, limit, totalPages };
  }

  async createRole(dto: CreateRoleDto) {
    return this.roleRepository.save(
      this.roleRepository.create({ name: dto.name.trim() }),
    );
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.findRole(id);
    if (["admin", "user"].includes(role.name)) {
      throw new BadRequestException("Không thể sửa vai trò mặc định");
    }
    if (dto.name !== undefined) role.name = dto.name.trim();
    return this.roleRepository.save(role);
  }

  async removeRole(id: number) {
    const role = await this.findRole(id);
    if (["admin", "user"].includes(role.name)) {
      throw new BadRequestException("Không thể xóa vai trò mặc định");
    }
    const assignments = await this.userRoleRepository.countBy({ idRole: id });
    if (assignments > 0) {
      throw new BadRequestException("Không thể xóa vai trò đang được gán");
    }
    await this.roleRepository.remove(role);
    return { message: "Đã xóa vai trò" };
  }

  async findAssignments({ page, limit, search }: PaginationQueryDto) {
    const query = this.userRoleRepository
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.user", "user")
      .leftJoinAndSelect("assignment.role", "role");
    if (search) {
      query.where(
        "(user.name LIKE :search OR user.email LIKE :search OR role.name LIKE :search)",
        { search: `%${search}%` },
      );
    }
    const [data, total] = await query
      .orderBy("assignment.id", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const pageData =
      effectivePage === page
        ? data
        : await query
            .clone()
            .skip((effectivePage - 1) * limit)
            .take(limit)
            .getMany();

    return { data: pageData, total, page: effectivePage, limit, totalPages };
  }

  async assignUserRole(dto: AssignUserRoleDto) {
    const [user, role] = await Promise.all([
      this.userRepository.findOneBy({ id: dto.idUser }),
      this.roleRepository.findOneBy({ id: dto.idRole }),
    ]);
    if (!user) throw new NotFoundException("Không tìm thấy tài khoản");
    if (!role) throw new NotFoundException("Không tìm thấy vai trò");

    const assignment = await this.userRoleRepository.findOneBy({
      idUser: dto.idUser,
      idRole: dto.idRole,
    });
    if (assignment) throw new BadRequestException("Vai trò đã được gán cho tài khoản này");

    return this.userRoleRepository.save(
      this.userRoleRepository.create(dto),
    );
  }

  async removeAssignment(id: number) {
    const assignment = await this.userRoleRepository.findOneBy({ id });
    if (!assignment) throw new NotFoundException("Không tìm thấy phân quyền");
    const role = await this.roleRepository.findOneBy({ id: assignment.idRole });
    if (role?.name === "admin") {
      const adminAssignments = await this.userRoleRepository.countBy({
        idRole: assignment.idRole,
      });
      if (adminAssignments <= 1) {
        throw new BadRequestException("Phải duy trì ít nhất một quản trị viên");
      }
    }
    await this.userRoleRepository.remove(assignment);
    return { message: "Đã xóa phân quyền" };
  }

  async assignDefaultRole(userId: number, email: string | null) {
    const roleName =
      email?.toLowerCase() === INITIAL_ADMIN_EMAIL ? "admin" : "user";
    await this.assignRoleIfMissing(userId, roleName);
  }

  private async assignRoleIfMissing(userId: number, roleName: string) {
    const role = await this.roleRepository.findOneBy({ name: roleName });
    if (!role) throw new NotFoundException(`Không tìm thấy vai trò ${roleName}`);

    const exists = await this.userRoleRepository.findOneBy({
      idUser: userId,
      idRole: role.id,
    });
    if (!exists) {
      await this.userRoleRepository.save(
        this.userRoleRepository.create({ idUser: userId, idRole: role.id }),
      );
    }
  }

  private async findRole(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new NotFoundException("Không tìm thấy vai trò");
    return role;
  }
}
