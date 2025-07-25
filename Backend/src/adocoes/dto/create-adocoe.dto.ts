import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateAdocoeDto {
  @IsString()
  @IsUUID(undefined, { message: 'O ID do animal deve ser um UUID válido.'})
  @IsNotEmpty({ message: 'O ID do animal é obrigatório.' })
  animalId: string;

  
  @IsString()
  @IsNotEmpty({ message: 'O tipo de moradia é obrigatório.' })
  tipoMoradia: string;

  @IsString()
  @IsNotEmpty({ message: 'A informação sobre outros animais é obrigatória.' })
  outrosAnimais: string;

  @IsString()
  @IsNotEmpty({ message: 'A informação sobre o tempo disponível é obrigatória.' })
  tempoDisponivel: string;

  @IsString()
  @IsOptional()
  motivoAdocao?: string;
}
