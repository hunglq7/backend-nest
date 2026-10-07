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
import { ThietBiService } from "./thiet_bi.service";
import { CreateThietBiDto } from "./dto/create-thiet_bi.dto";
import { UpdateThietBiDto } from "./dto/update-thiet_bi.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
@UseGuards(AccessTokenGuard)
@Controller("thietbis")
export class ThietBiController {
  constructor(private readonly thietBiService: ThietBiService) {}

  @Post()
  create(@Body() createThietBiDto: CreateThietBiDto) {
    return this.thietBiService.create(createThietBiDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.thietBiService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.thietBiService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateThietBiDto: UpdateThietBiDto) {
    return this.thietBiService.update(+id, updateThietBiDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.thietBiService.remove(+id);
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
  
      return this.thietBiService.removeMany(ids);
    }
}
