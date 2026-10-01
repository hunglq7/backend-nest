import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { DonViService } from "./don_vi.service";
import { CreateDonViDto } from "./dto/create-don_vi.dto";
import { UpdateDonViDto } from "./dto/update-don_vi.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
@Controller("donvis")
@UseGuards(AccessTokenGuard)
export class DonViController {
  constructor(private readonly donViService: DonViService) {}

  @Post()
  create(@Body() createDonViDto: CreateDonViDto) {
    return this.donViService.create(createDonViDto);
  }

  @Get()
  findAll() {
    return this.donViService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.donViService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDonViDto: UpdateDonViDto) {
    return this.donViService.update(+id, updateDonViDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.donViService.remove(+id);
  }
}
