import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateConquistaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  descricao: string;

  @IsString()
  @IsNotEmpty({ message: 'O ícone não pode ser vazio.' })
  icone: string;

  @IsInt({ message: 'Os pontos de bónus devem ser um número inteiro.' })
  @IsPositive({ message: 'Os pontos de bónus devem ser um número positivo.' })
  @IsOptional()
  pontosBonus?: number;
}