import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from "class-validator";

export class CreateThongSoKyThuatDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ma_thong_so?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  ten_thong_so: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cap_tren_id?: number | null;

  @IsOptional()
  @IsString()
  gia_tri?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  don_vi_tinh?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  don_vi?: string | null;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsString()
  ghi_chu?: string | null;
}
