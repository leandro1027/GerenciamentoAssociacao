import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnimalComunitarioDto {
  @IsString()
  @IsNotEmpty()
  nomeTemporario: string;

  @IsString()
  @IsOptional()
  enderecoCompleto?: string; //opcional para o cadastro e mapeamento

  @IsNumber()
  @Type(() => Number) 
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @Type(() => Number) 
  @IsNotEmpty()
  longitude: number;
}