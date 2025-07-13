import { IsIn, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateDoacaoDto {

  @IsInt({ message: 'O ID do usuário deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID do usuário não pode estar vazio.' })
  usuarioId: number;

  
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsPositive({ message: 'O valor da doação deve ser um número positivo.' })
  valor: number;


  @IsString({ message: 'O tipo deve ser um texto.' })
  @IsIn(['pix'], { message: "O tipo de doação deve ser 'pix'." })
  tipo: string;
}

