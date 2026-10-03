import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { KhuVucService } from './khu_vuc.service';
import { CreateKhuVucDto } from './dto/create-khu_vuc.dto';
import { UpdateKhuVucDto } from './dto/update-khu_vuc.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('khuvucs')
export class KhuVucController {
  constructor(private readonly khuVucService: KhuVucService) {}

  @Post()
  create(@Body() createKhuVucDto: CreateKhuVucDto) {
    return this.khuVucService.create(createKhuVucDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.khuVucService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.khuVucService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKhuVucDto: UpdateKhuVucDto) {
    return this.khuVucService.update(+id, updateKhuVucDto);
  }

  @Delete()
  removeMany(@Body() body: unknown) {
    const ids =
      typeof body === 'object' && body !== null && 'ids' in body
        ? body.ids
        : undefined;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every(
        (id: unknown) =>
          typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
      )
    ) {
      throw new BadRequestException('Danh sách ID khu vực không hợp lệ');
    }

    return this.khuVucService.removeMany(ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.khuVucService.remove(+id);
  }
}
