import { IsNotEmpty, IsString, Length } from "class-validator";
export class CreateKhuVucDto {
  @IsNotEmpty({ message: "Mã khu vực không được trống" })
  @IsString()
  @Length(2, 2, { message: "Mã khu vực phải có đúng 2 ký tự" })
  ma_khu_vuc: string;

  @IsNotEmpty({ message: "Tên khu vực không được trống" })
  @IsString()
  ten_khu_vuc: string;
}
