import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSlideDto {

  @IsString()
  @IsNotEmpty({ message: 'O título não pode estar vazio.' })
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;
}
