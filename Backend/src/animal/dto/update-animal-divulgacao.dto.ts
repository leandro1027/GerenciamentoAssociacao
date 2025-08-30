import { IsEnum, IsNotEmpty } from 'class-validator';
import { DivulgacaoStatus } from '@prisma/client';

export class UpdateAnimalDivulgacaoDto {
  @IsEnum(DivulgacaoStatus)
  @IsNotEmpty()
  status: DivulgacaoStatus;
}
