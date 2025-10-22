import { IsEnum, IsNotEmpty } from 'class-validator';
import { DivulgacaoStatus } from '@prisma/client';

export class UpdateDivulgacaoStatusDto {
  @IsEnum(DivulgacaoStatus)
  @IsNotEmpty()
  status: DivulgacaoStatus;
}