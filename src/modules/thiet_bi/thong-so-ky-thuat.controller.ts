import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { CreateThongSoKyThuatDto } from "./dto/create-thong-so-ky-thuat.dto";
import { UpdateThongSoKyThuatDto } from "./dto/update-thong-so-ky-thuat.dto";
import { ThongSoKyThuatService } from "./thong-so-ky-thuat.service";

@UseGuards(AccessTokenGuard)
@Controller("thietbis/:deviceId/thong-so-ky-thuats")
export class ThongSoKyThuatController {
  constructor(private readonly service: ThongSoKyThuatService) {}

  @Get()
  findAll(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(deviceId, query);
  }

  @Post()
  create(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Body() dto: CreateThongSoKyThuatDto,
  ) {
    return this.service.create(deviceId, dto);
  }

  @Get(":specId")
  findOne(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Param("specId", ParseIntPipe) specId: number,
  ) {
    return this.service.findOne(deviceId, specId);
  }

  @Patch(":specId")
  update(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Param("specId", ParseIntPipe) specId: number,
    @Body() dto: UpdateThongSoKyThuatDto,
  ) {
    return this.service.update(deviceId, specId, dto);
  }

  @Delete("bulk")
  removeMany(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Body() body: unknown,
  ) {
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
      throw new BadRequestException("Danh sách ID thông số kỹ thuật không hợp lệ");
    }

    return this.service.removeMany(deviceId, ids);
  }

  @Delete(":specId")
  remove(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Param("specId", ParseIntPipe) specId: number,
  ) {
    return this.service.remove(deviceId, specId);
  }
}
