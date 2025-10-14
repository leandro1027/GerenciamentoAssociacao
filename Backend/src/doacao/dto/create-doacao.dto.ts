// arquivo: src/doacao/dto/create-doacao.dto.ts

import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Type } from "class-transformer"; // 1. Importar o decorador Type

export class CreateDoacaoDto {
  
  @Type(() => Number) // 2. Adicionar para transformar a string "123" em número 123
  @IsInt({ message: 'O ID do usuário deve ser um número inteiro.' })
  @IsOptional()
  usuarioId: number;
  
  @Type(() => Number) // 3. Adicionar para transformar a string "50.00" em número 50
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsPositive({ message: 'O valor da doação deve ser um número positivo.' })
  valor: number;

  @IsString({ message: 'O tipo deve ser um texto.' })
  @IsIn(['pix'], { message: "O tipo de doação deve ser 'pix'." })
  tipo: string;
}