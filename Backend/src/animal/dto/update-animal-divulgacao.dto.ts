import { IsEnum, IsNotEmpty } from 'class-validator';
import { DivulgacaoStatus } from 'generated/prisma';

export class UpdateAnimalDivulgacaoDto {
  @IsEnum(DivulgacaoStatus)
  @IsNotEmpty()
  status: DivulgacaoStatus;
}
