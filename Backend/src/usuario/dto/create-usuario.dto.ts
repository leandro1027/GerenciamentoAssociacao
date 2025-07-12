import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  telefone?: string;
}