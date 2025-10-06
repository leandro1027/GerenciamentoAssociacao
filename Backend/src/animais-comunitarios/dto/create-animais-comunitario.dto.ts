import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnimalComunitarioDto {
  @IsString()
  @IsNotEmpty()
  nomeTemporario: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  rua: string;
}