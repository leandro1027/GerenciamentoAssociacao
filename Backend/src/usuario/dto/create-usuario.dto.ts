import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({message: "O nome não pode ser vazio."})
  nome: string;

  @IsEmail({}, { message: 'Por favor, insira um endereço de e-mail válido.'})
  email: string;

 @IsString()
    @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
    @Matches(/(?=.*[a-z])/, { message: 'A senha deve conter pelo menos uma letra minúscula.' })
    @Matches(/(?=.*[A-Z])/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' })
    @Matches(/(?=.*\d)/, { message: 'A senha deve conter pelo menos um número.' })
    @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, { message: 'A senha deve conter pelo menos um caractere especial.' })
  senha: string;

  @IsPhoneNumber('BR', { message: 'Informe um número de telefone válido.' })
  @IsOptional()
  telefone?: string;
}
