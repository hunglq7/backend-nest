import { IsNotEmpty, IsString } from "class-validator";
export class CreateLoaiThietBiDto {
  @IsNotEmpty({ message: "Tên loại thiết bị không được trống" })
  @IsString()
  loai_thiet_bi: string;
}
