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
import {
  HandoverQueryDto,
  MoveQueryDto,
  PaginationQueryDto,
} from "../../common/dto/pagination-query.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { DeviceWorkflowsService } from "./device-workflows.service";
import { HandoverDto } from "./dto/handover.dto";
import { MoveDto } from "./dto/move.dto";
import { ReceiptDto } from "./dto/receipt.dto";
import { StatusUpdateDto } from "./dto/status-update.dto";

@UseGuards(AccessTokenGuard)
@Controller("ban-giao-thiet-bi")
export class HandoverController {
  constructor(private readonly service: DeviceWorkflowsService) {}
  @Get() list(@Query() query: HandoverQueryDto) {
    return this.service.findAll("handover", query);
  }
  @Post() create(@Body() dto: HandoverDto) {
    return this.service.handover(dto);
  }
  @Patch(":id") update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: HandoverDto,
  ) {
    return this.service.updateHandover(id, dto);
  }
  @Delete("bulk") removeMany(@Body() body: { ids?: number[] }) {
    return this.service.removeHandovers(body.ids ?? []);
  }
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeHandovers([id]);
  }
}

@UseGuards(AccessTokenGuard)
@Controller("tiep-nhan-thiet-bi")
export class ReceiptController {
  constructor(private readonly service: DeviceWorkflowsService) {}
  @Get() list(@Query() query: HandoverQueryDto) {
    return this.service.findReceivableHandovers(query);
  }
  @Post() create(@Body() dto: ReceiptDto) {
    return this.service.receive(dto);
  }
  @Patch(":id/receive")
  receiveHandover(@Param("id", ParseIntPipe) id: number) {
    return this.service.receiveHandover(id);
  }
  @Patch(":id/reverse-handover")
  reverseHandoverReceipt(@Param("id", ParseIntPipe) id: number) {
    return this.service.reverseHandoverReceipt(id);
  }
  @Patch(":id/approve") approve(@Param("id", ParseIntPipe) id: number) {
    return this.service.approveReceipt(id);
  }
  @Patch(":id/reverse") reverse(@Param("id", ParseIntPipe) id: number) {
    return this.service.reverseReceipt(id);
  }
}

@UseGuards(AccessTokenGuard)
@Controller("di-chuyen-thiet-bi")
export class MoveController {
  constructor(private readonly service: DeviceWorkflowsService) {}
  @Get() list(@Query() query: MoveQueryDto) {
    return this.service.findAll("move", query);
  }
  @Post() create(@Body() dto: MoveDto) {
    return this.service.move(dto);
  }
  @Patch(":id") update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: MoveDto,
  ) {
    return this.service.updateMove(id, dto);
  }
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeMove(id);
  }
}

@UseGuards(AccessTokenGuard)
@Controller("cap-nhat-trang-thai")
export class StatusUpdateController {
  constructor(private readonly service: DeviceWorkflowsService) {}
  @Get() list(@Query() query: PaginationQueryDto) {
    return this.service.findAll("status", query);
  }
  @Post() create(@Body() dto: StatusUpdateDto) {
    return this.service.updateStatus(dto);
  }
}
