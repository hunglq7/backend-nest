import { PartialType } from "@nestjs/mapped-types";
import { CreateThongSoKyThuatDto } from "./create-thong-so-ky-thuat.dto";

export class UpdateThongSoKyThuatDto extends PartialType(
  CreateThongSoKyThuatDto,
) {}
