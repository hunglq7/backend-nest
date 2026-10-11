import { IsNotEmpty, IsString, Length } from "class-validator";
export class CreateDonViTinhDto {
  @IsNotEmpty({ message: "Mã đơn vị tính không được trống" })
  @IsString()
  @Length(2, 2, { message: "Mã đơn vị tính phải có đúng 2 ký tự" })
  ma_don_vi_tinh: string;

  @IsNotEmpty({ message: "Tên đơn vị tính không được trống" })
  @IsString()
  ten_don_vi_tinh: string;
}
