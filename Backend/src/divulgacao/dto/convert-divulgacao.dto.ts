// src/divulgacao/dto/convert-divulgacao.dto.ts
import { Especie, Porte, Sexo } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ConvertDivulgacaoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  raca: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;
  
  @IsString()
  @IsNotEmpty()
  idade: string;

  @IsEnum(Especie)
  @IsNotEmpty()
  especie: Especie;

  @IsEnum(Sexo)
  @IsNotEmpty()
  sexo: Sexo;

  @IsEnum(Porte)
  @IsNotEmpty()
  porte: Porte;
}