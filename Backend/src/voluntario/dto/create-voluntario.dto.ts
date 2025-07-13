import { IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateVoluntarioDto {
    
  @IsInt({ message: 'O ID do usuário deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID do usuário não pode estar vazio.' })
  usuarioId: number;

  @IsString({ message: 'O motivo deve ser um texto.' })
  @IsNotEmpty({ message: 'O motivo não pode estar vazio.' })
  @MinLength(10, { message: 'O motivo deve ter pelo menos 10 caracteres.'})
  motivo: string;

}
