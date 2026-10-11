import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class StatusUpdateDto {
  @IsOptional() @IsString() @MaxLength(100)
  so_chung_tu?: string | null;

  @IsOptional() @IsDateString()
  ngay_chung_tu?: string | null;

  @IsOptional() @IsInt() @Min(1)
  don_vi_lap_id?: number | null;

  @IsInt() @Min(1)
  thiet_bi_id: number;

  @IsInt() @Min(1)
  trang_thai_thiet_bi_id: number;

  @IsOptional() @IsDateString()
  ngay_ap_dung?: string | null;

  @IsOptional() @IsString()
  noi_dung?: string | null;

  @IsOptional() @IsString()
  ghi_chu?: string | null;

  @IsOptional() @IsDateString()
  ngay_cap_nhat?: string | null;
}
