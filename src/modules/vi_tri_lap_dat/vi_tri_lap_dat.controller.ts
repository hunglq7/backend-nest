import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViTriLapDatService } from './vi_tri_lap_dat.service';
import { CreateViTriLapDatDto } from './dto/create-vi_tri_lap_dat.dto';
import { UpdateViTriLapDatDto } from './dto/update-vi_tri_lap_dat.dto';

@Controller('vi-tri-lap-dat')
export class ViTriLapDatController {
  constructor(private readonly viTriLapDatService: ViTriLapDatService) {}

  @Post()
  create(@Body() createViTriLapDatDto: CreateViTriLapDatDto) {
    return this.viTriLapDatService.create(createViTriLapDatDto);
  }

  @Get()
  findAll() {
    return this.viTriLapDatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viTriLapDatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViTriLapDatDto: UpdateViTriLapDatDto) {
    return this.viTriLapDatService.update(+id, updateViTriLapDatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viTriLapDatService.remove(+id);
  }
}
