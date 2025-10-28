import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAnimalComunitarioDto {
  @IsString()
  @IsNotEmpty()
  nomeTemporario: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  enderecoCompleto?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
}