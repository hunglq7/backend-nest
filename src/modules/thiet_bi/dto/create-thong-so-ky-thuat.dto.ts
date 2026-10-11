import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @IsString()
  @IsNotEmpty()
  gia_tri: string;

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
