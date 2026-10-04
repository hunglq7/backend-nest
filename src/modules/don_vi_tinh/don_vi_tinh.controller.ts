import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { DonViTinhService } from "./don_vi_tinh.service";
import { CreateDonViTinhDto } from "./dto/create-don_vi_tinh.dto";
import { UpdateDonViTinhDto } from "./dto/update-don_vi_tinh.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";

@Controller("donvitinhs")
@UseGuards(AccessTokenGuard)
export class DonViTinhController {
  constructor(private readonly donViTinhService: DonViTinhService) {}

  @Post()
  create(@Body() createDonViTinhDto: CreateDonViTinhDto) {
    return this.donViTinhService.create(createDonViTinhDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.donViTinhService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.donViTinhService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateDonViTinhDto: UpdateDonViTinhDto,
  ) {
    return this.donViTinhService.update(+id, updateDonViTinhDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.donViTinhService.remove(+id);
  }

  @Delete()
  removeMany(@Body() body: unknown) {
    const ids =
      typeof body === "object" && body !== null && "ids" in body
        ? body.ids
        : undefined;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every(
        (id: unknown) =>
          typeof id === "number" && Number.isSafeInteger(id) && id > 0,
      )
    ) {
      throw new BadRequestException("Danh sách ID đơn vị không hợp lệ");
    }

    return this.donViTinhService.removeMany(ids);
  }
}
