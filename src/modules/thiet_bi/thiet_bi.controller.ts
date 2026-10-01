import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ThietBiService } from "./thiet_bi.service";
import { CreateThietBiDto } from "./dto/create-thiet_bi.dto";
import { UpdateThietBiDto } from "./dto/update-thiet_bi.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";

@UseGuards(AccessTokenGuard)
@Controller("thietbis")
export class ThietBiController {
  constructor(private readonly thietBiService: ThietBiService) {}

  @Post()
  create(@Body() createThietBiDto: CreateThietBiDto) {
    return this.thietBiService.create(createThietBiDto);
  }

  @Get()
  findAll() {
    return this.thietBiService.findAll();
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
}
