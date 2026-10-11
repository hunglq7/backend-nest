import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { CreateCatalogDto } from "./dto/create-catalog.dto";
import { UpdateCatalogDto } from "./dto/update-catalog.dto";
import { CatalogKey, CatalogsService } from "./catalogs.service";

abstract class CatalogController {
  protected abstract readonly key: CatalogKey;

  constructor(protected readonly service: CatalogsService) {}

  protected findAll(query: PaginationQueryDto) {
    return this.service.findAll(this.key, query);
  }

  protected findOne(id: number) {
    return this.service.findOne(this.key, id);
  }

  protected create(dto: CreateCatalogDto) {
    return this.service.create(this.key, dto);
  }

  protected update(id: number, dto: UpdateCatalogDto) {
    return this.service.update(this.key, id, dto);
  }

  protected remove(id: number) {
    return this.service.deactivate(this.key, id);
  }
}

@UseGuards(AccessTokenGuard)
@Controller("loai-bao-tris")
export class LoaiBaoTriController extends CatalogController {
  protected readonly key = "loai-bao-tris" as const;
  constructor(service: CatalogsService) { super(service); }
  @Get() list(@Query() query: PaginationQueryDto) { return this.findAll(query); }
  @Get(":id") get(@Param("id", ParseIntPipe) id: number) { return this.findOne(id); }
  @Post() add(@Body() dto: CreateCatalogDto) { return this.create(dto); }
  @Patch(":id") edit(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) { return this.update(id, dto); }
  @Delete(":id") delete(@Param("id", ParseIntPipe) id: number) { return this.remove(id); }
}

@UseGuards(AccessTokenGuard)
@Controller("loai-hieu-chuans")
export class LoaiHieuChuanController extends CatalogController {
  protected readonly key = "loai-hieu-chuans" as const;
  constructor(service: CatalogsService) { super(service); }
  @Get() list(@Query() query: PaginationQueryDto) { return this.findAll(query); }
  @Get(":id") get(@Param("id", ParseIntPipe) id: number) { return this.findOne(id); }
  @Post() add(@Body() dto: CreateCatalogDto) { return this.create(dto); }
  @Patch(":id") edit(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) { return this.update(id, dto); }
  @Delete(":id") delete(@Param("id", ParseIntPipe) id: number) { return this.remove(id); }
}

@UseGuards(AccessTokenGuard)
@Controller("loai-kiem-dinhs")
export class LoaiKiemDinhController extends CatalogController {
  protected readonly key = "loai-kiem-dinhs" as const;
  constructor(service: CatalogsService) { super(service); }
  @Get() list(@Query() query: PaginationQueryDto) { return this.findAll(query); }
  @Get(":id") get(@Param("id", ParseIntPipe) id: number) { return this.findOne(id); }
  @Post() add(@Body() dto: CreateCatalogDto) { return this.create(dto); }
  @Patch(":id") edit(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) { return this.update(id, dto); }
  @Delete(":id") delete(@Param("id", ParseIntPipe) id: number) { return this.remove(id); }
}

@UseGuards(AccessTokenGuard)
@Controller("trang-thai-thiet-bis")
export class TrangThaiThietBiController extends CatalogController {
  protected readonly key = "trang-thai-thiet-bis" as const;
  constructor(service: CatalogsService) { super(service); }
  @Get() list(@Query() query: PaginationQueryDto) { return this.findAll(query); }
  @Get(":id") get(@Param("id", ParseIntPipe) id: number) { return this.findOne(id); }
  @Post() add(@Body() dto: CreateCatalogDto) { return this.create(dto); }
  @Patch(":id") edit(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) { return this.update(id, dto); }
  @Delete(":id") delete(@Param("id", ParseIntPipe) id: number) { return this.remove(id); }
}
