import { IsNotEmpty, IsString } from "class-validator";
export class CreateDonViDto {
  @IsNotEmpty({ message: "Tên đơn vị không được trống" })
  @IsString()
  ten_don_vi: string;
}
