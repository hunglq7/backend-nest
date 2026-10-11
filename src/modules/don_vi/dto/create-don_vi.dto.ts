import { IsNotEmpty, IsString } from "class-validator";
export class CreateDonViDto {
  @IsNotEmpty({ message: "Mã đơn vị không được trống" })
  @IsString()
  ma_don_vi: string;

  @IsNotEmpty({ message: "Tên đơn vị không được trống" })
  @IsString()
  ten_don_vi: string;
}
