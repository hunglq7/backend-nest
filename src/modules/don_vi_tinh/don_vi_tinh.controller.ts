import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonViTinhService } from './don_vi_tinh.service';
import { CreateDonViTinhDto } from './dto/create-don_vi_tinh.dto';
import { UpdateDonViTinhDto } from './dto/update-don_vi_tinh.dto';

@Controller('don-vi-tinh')
export class DonViTinhController {
  constructor(private readonly donViTinhService: DonViTinhService) {}

  @Post()
  create(@Body() createDonViTinhDto: CreateDonViTinhDto) {
    return this.donViTinhService.create(createDonViTinhDto);
  }

  @Get()
  findAll() {
    return this.donViTinhService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donViTinhService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDonViTinhDto: UpdateDonViTinhDto) {
    return this.donViTinhService.update(+id, updateDonViTinhDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donViTinhService.remove(+id);
  }
}
