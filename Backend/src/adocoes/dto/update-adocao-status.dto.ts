import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusAdocao } from 'generated/prisma';

export class UpdateAdocaoStatusDto {
  @IsEnum(StatusAdocao)
  @IsNotEmpty()
  status: StatusAdocao;
}

