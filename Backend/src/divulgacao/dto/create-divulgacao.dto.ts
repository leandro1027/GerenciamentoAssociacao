import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

const toBoolean = (value: string): boolean => value === 'true';

export class CreateDivulgacaoDto {
  @IsString()
  @IsNotEmpty()
  localizacao: string;

  @IsString()
  @IsNotEmpty()
  raca: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  castrado: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  resgate: boolean;

  @IsString()
  @IsOptional()
  descricao?: string;
}