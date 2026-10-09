import { IsNotEmpty, IsString } from "class-validator";
export class CreateDonViTinhDto {
  @IsNotEmpty({ message: "Tên đơn vị tính không được trống" })
  @IsString()
  ten_don_vi_tinh: string;
}
