import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { StatusDoacao } from 'generated/prisma';

export class UpdateDoacaoStatusDto {
  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status não pode estar vazio.' })
  @IsIn([StatusDoacao.CONFIRMADA, StatusDoacao.REJEITADA], {
    message: `O status deve ser '${StatusDoacao.CONFIRMADA}' ou '${StatusDoacao.REJEITADA}'.`,
  })
  status: StatusDoacao;
}