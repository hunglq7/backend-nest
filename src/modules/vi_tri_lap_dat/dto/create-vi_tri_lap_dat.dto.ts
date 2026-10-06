import { IsNotEmpty, IsString } from "class-validator";
export class CreateViTriLapDatDto {
  @IsNotEmpty({ message: "Vị trí lắp đặt không được trống" })
  @IsString()
  name: string;
}
