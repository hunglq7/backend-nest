import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Giá sản phẩm phải là một số' })
  @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}