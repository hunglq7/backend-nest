import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import type { Request } from "express";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AdminGuard } from "../roles/guards/admin.guard";

const avatarUpload = FileInterceptor("avatar", {
  storage: diskStorage({
    destination: join(process.cwd(), "public", "image"),
    filename: (_request, file, callback) => {
      callback(
        null,
        `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      callback(
        new Error("Ảnh đại diện phải là JPEG, PNG, WEBP hoặc GIF"),
        false,
      );
      return;
    }
    callback(null, true);
  },
});

interface AuthenticatedRequest extends Request {
  user: { sub: number };
}

interface UploadedAvatar {
  filename: string;
}

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@Req() request: AuthenticatedRequest) {
    return this.usersService.findOne(request.user.sub);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(avatarUpload)
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar?: UploadedAvatar,
  ) {
    return this.usersService.create(
      createUserDto,
      avatar ? `/image/${avatar.filename}` : undefined,
    );
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(AdminGuard)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  @UseInterceptors(avatarUpload)
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: UploadedAvatar,
  ) {
    return this.usersService.update(
      +id,
      updateUserDto,
      avatar ? `/image/${avatar.filename}` : undefined,
    );
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
