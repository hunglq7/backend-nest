import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ReceiptDto {
  @IsOptional() @IsInt() @Min(1)
  ban_giao_id?: number;

  @IsOptional() @IsInt() @Min(1)
  thiet_bi_id?: number;

  @IsOptional() @IsDateString()
  ngay_tiep_nhan?: string;

  @IsOptional() @IsString()
  noi_dung?: string;

  @IsOptional() @IsString()
  ghi_chu?: string;
}
