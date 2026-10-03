import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LoaiThietBiService } from './loai_thiet_bi.service';
import { CreateLoaiThietBiDto } from './dto/create-loai_thiet_bi.dto';
import { UpdateLoaiThietBiDto } from './dto/update-loai_thiet_bi.dto';
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
@Controller('loai-thiet-bi')
@UseGuards(AccessTokenGuard)
export class LoaiThietBiController {
  constructor(private readonly loaiThietBiService: LoaiThietBiService) {}

  @Post()
  create(@Body() createLoaiThietBiDto: CreateLoaiThietBiDto) {
    return this.loaiThietBiService.create(createLoaiThietBiDto);
  }

  @Get()
  findAll() {
    return this.loaiThietBiService.findAll();
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
}
