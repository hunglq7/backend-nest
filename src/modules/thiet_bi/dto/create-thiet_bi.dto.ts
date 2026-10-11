import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateThietBiDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ten_thiet_bi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ma_thiet_bi?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  so_quan_ly?: string | null;

  @IsOptional()
  @IsString()
  nhiem_vu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  don_vi_tinh_id?: number | null;

  @IsOptional()
  @IsDateString()
  ngay_dua_vao_su_dung?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nuoc_san_xuat?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  loai_thiet_bi_id?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  don_vi_id?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phong_chu_quan?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  phong_chu_quan_id?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  khu_vuc_id?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  vi_tri_lap_dat_id?: number | null;

  @IsOptional()
  @IsBoolean()
  tai_san?: boolean | null;

  @IsOptional()
  @IsBoolean()
  locked?: boolean | null;

  @IsOptional()
  @IsString()
  ghi_chu?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  trang_thai_thiet_bi_id?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  don_vi_nhan_id?: number | null;
}
