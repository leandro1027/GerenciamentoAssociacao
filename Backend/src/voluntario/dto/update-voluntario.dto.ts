import { PartialType } from '@nestjs/mapped-types';
import { CreateVoluntarioDto } from './create-voluntario.dto';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateVoluntarioDto extends PartialType(CreateVoluntarioDto) {

  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status não pode estar vazio.' })
  @IsIn(['pendente', 'aprovado', 'recusado'], { message: "O status deve ser 'pendente', 'aprovado' ou 'recusado'."})
  status: string;
}
