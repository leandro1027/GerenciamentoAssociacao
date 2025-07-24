import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Especie, Sexo, Porte } from 'generated/prisma';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(Especie)
  @IsNotEmpty()
  especie: Especie;

  @IsEnum(Sexo)
  @IsNotEmpty()
  sexo: Sexo;

  @IsEnum(Porte)
  @IsNotEmpty()
  porte: Porte;

 @IsString()
  @IsNotEmpty()
  raca: string;

  @IsString()
  @IsNotEmpty()
  idade: string;
  
  @IsString()
  @IsOptional()
  animalImageUrl?: string;
}