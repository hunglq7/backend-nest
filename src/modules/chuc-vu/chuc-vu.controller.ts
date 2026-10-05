import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChucVuService } from './chuc-vu.service';
import { CreateChucVuDto } from './dto/create-chuc-vu.dto';
import { UpdateChucVuDto } from './dto/update-chuc-vu.dto';

@Controller('chuc-vu')
export class ChucVuController {
  constructor(private readonly chucVuService: ChucVuService) {}

  @Post()
  create(@Body() createChucVuDto: CreateChucVuDto) {
    return this.chucVuService.create(createChucVuDto);
  }

  @Get()
  findAll() {
    return this.chucVuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chucVuService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChucVuDto: UpdateChucVuDto) {
    return this.chucVuService.update(+id, updateChucVuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chucVuService.remove(+id);
  }
}
