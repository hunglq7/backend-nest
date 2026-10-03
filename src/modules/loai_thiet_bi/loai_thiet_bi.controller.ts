import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { LoaiThietBiService } from './loai_thiet_bi.service';
import { CreateLoaiThietBiDto } from './dto/create-loai_thiet_bi.dto';
import { UpdateLoaiThietBiDto } from './dto/update-loai_thiet_bi.dto';
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
@Controller('loaithietbis')
@UseGuards(AccessTokenGuard)
export class LoaiThietBiController {
  constructor(private readonly loaiThietBiService: LoaiThietBiService) {}

  @Post()
  create(@Body() createLoaiThietBiDto: CreateLoaiThietBiDto) {
    return this.loaiThietBiService.create(createLoaiThietBiDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.loaiThietBiService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loaiThietBiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoaiThietBiDto: UpdateLoaiThietBiDto) {
    return this.loaiThietBiService.update(+id, updateLoaiThietBiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loaiThietBiService.remove(+id);
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
        throw new BadRequestException("Danh sách ID loại thiết bị không hợp lệ");
      }
  
      return this.loaiThietBiService.removeMany(ids);
    }
}
