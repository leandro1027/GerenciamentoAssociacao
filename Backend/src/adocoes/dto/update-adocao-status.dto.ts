import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusAdocao } from '@prisma/client';

export class UpdateAdocaoStatusDto {
  @IsEnum(StatusAdocao)
  @IsNotEmpty()
  status: StatusAdocao;
}

