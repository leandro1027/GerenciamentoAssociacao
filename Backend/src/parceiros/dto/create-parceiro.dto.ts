import { IsNotEmpty, IsString } from "class-validator";

export class CreateParceiroDto {
    @IsString({ message: 'O nome deve ser um texto.' })
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    nome: string;
}