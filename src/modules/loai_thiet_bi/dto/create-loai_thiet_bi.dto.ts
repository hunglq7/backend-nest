import { IsNotEmpty, IsString, Length } from "class-validator";
export class CreateLoaiThietBiDto {
  @IsNotEmpty({ message: "Mã loại thiết bị không được trống" })
  @IsString()
  @Length(2, 2, { message: "Mã loại thiết bị phải có đúng 2 ký tự" })
  ma_loai_thiet_bi: string;

  @IsNotEmpty({ message: "Tên loại thiết bị không được trống" })
  @IsString()
  loai_thiet_bi: string;
}
