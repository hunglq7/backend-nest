import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ViTriLapDatService } from "./vi_tri_lap_dat.service";
import { CreateViTriLapDatDto } from "./dto/create-vi_tri_lap_dat.dto";
import { UpdateViTriLapDatDto } from "./dto/update-vi_tri_lap_dat.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
@UseGuards(AccessTokenGuard)
@Controller("vitrilapdats")
export class ViTriLapDatController {
  constructor(private readonly viTriLapDatService: ViTriLapDatService) {}

  @Post()
  create(@Body() createViTriLapDatDto: CreateViTriLapDatDto) {
    return this.viTriLapDatService.create(createViTriLapDatDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.viTriLapDatService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.viTriLapDatService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateViTriLapDatDto: UpdateViTriLapDatDto,
  ) {
    return this.viTriLapDatService.update(+id, updateViTriLapDatDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.viTriLapDatService.remove(+id);
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

    return this.viTriLapDatService.removeMany(ids);
  }
}
