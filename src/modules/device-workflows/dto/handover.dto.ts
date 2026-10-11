import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class HandoverDto {
  @IsInt() @Min(1)
  thiet_bi_id: number;

  @IsOptional() @IsInt() @Min(1)
  don_vi_lap_id?: number | null;

  @IsOptional() @IsDateString()
  ngay_quyet_dinh?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  so_quyet_dinh?: string | null;

  @IsOptional() @IsInt() @Min(1)
  don_vi_giao_id?: number | null;

  @IsOptional() @IsInt() @Min(1)
  don_vi_nhan_id?: number | null;

  @IsOptional() @IsInt() @Min(1)
  nguoi_nhan_id?: number | null;

  @IsOptional() @IsDateString()
  ngay_tiep_nhan?: string | null;

  @IsOptional() @IsString()
  noi_dung?: string | null;

  @IsOptional() @IsString()
  ghi_chu?: string | null;

  @IsOptional() @IsDateString()
  ngay_ban_giao?: string | null;
}
