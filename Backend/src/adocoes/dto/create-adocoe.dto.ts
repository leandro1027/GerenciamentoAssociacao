// Em: src/adocoes/dto/create-adocao.dto.ts

import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAdocoeDto {
  @IsString()
  @IsUUID(undefined, { message: 'O ID do animal deve ser um UUID válido.'})
  @IsNotEmpty({ message: 'O ID do animal é obrigatório.' })
  animalId: string;
}
