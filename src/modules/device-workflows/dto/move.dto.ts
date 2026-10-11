import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class MoveDto {
  @IsOptional() @IsInt() @Min(1)
  don_vi_id?: number | null;

  @IsInt() @Min(1)
  thiet_bi_id: number;

  @IsOptional() @IsDateString()
  ngay_chung_tu?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  so_chung_tu?: string | null;

  @IsInt() @Min(1)
  vi_tri_lap_dat_id: number;

  @IsOptional() @IsDateString()
  ngay_ap_dung?: string | null;

  @IsOptional() @IsString()
  noi_dung?: string | null;

  @IsOptional() @IsString()
  ghi_chu?: string | null;

  @IsOptional() @IsDateString()
  ngay_di_chuyen?: string | null;
}
