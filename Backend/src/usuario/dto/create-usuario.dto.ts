import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({message: "O nome não pode ser vazio."})
  nome: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  telefone?: string;
}