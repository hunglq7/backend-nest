import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Users } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RolesService } from "../roles/roles.service";
import * as bcrypt from "bcryptjs";
import { unlink } from "fs/promises";
import { basename, join } from "path";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly rolesService: RolesService,
  ) {}
  async create(createUserDto: CreateUserDto, avatar?: string) {
    const { password, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      avatar,
      passwordHash: await bcrypt.hash(password, 12),
    });
    try {
      const savedUser = await this.userRepository.save(user);
      await this.rolesService.assignDefaultRole(savedUser.id, savedUser.email);
      return this.toPublicUser(savedUser);
    } catch (error) {
      await this.removeAvatarFile(avatar);
      throw error;
    }
  }

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const query = this.userRepository.createQueryBuilder("user");
    if (search) {
      query.where(
        "(user.name LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)",
        { search: `%${search}%` },
      );
    }
    const [data, total] = await query
      .orderBy("user.id", "ASC")
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

  async findOne(id: number): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID = ${id}`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, avatar?: string) {
    const user = await this.findOne(id);
    const previousAvatar = user.avatar;
    const { password, ...userData } = updateUserDto;
    Object.assign(user, userData, avatar ? { avatar } : {});
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    try {
      const savedUser = this.toPublicUser(await this.userRepository.save(user));
      if (avatar && previousAvatar !== avatar) {
        await this.removeAvatarFile(previousAvatar);
      }
      return savedUser;
    } catch (error) {
      await this.removeAvatarFile(avatar);
      throw error;
    }
  }
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    await this.removeAvatarFile(user.avatar);
    return { message: `Đã xóa thành công user ID = ${id}` };
  }

  private async removeAvatarFile(avatar?: string) {
    if (!avatar?.startsWith("/image/")) return;
    try {
      await unlink(join(process.cwd(), "public", "image", basename(avatar)));
    } catch {
      // A missing avatar file does not prevent account changes.
    }
  }

  private toPublicUser(user: Users) {
    const { passwordHash, refreshTokenHash, ...publicUser } = user;
    return publicUser;
  }
}
