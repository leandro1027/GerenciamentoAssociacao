import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { StatusDoacao } from '@prisma/client';

export class UpdateDoacaoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([StatusDoacao.CONFIRMADA, StatusDoacao.REJEITADA])
  status: StatusDoacao;
}