import { PartialType } from '@nestjs/mapped-types';
import { CreateDivulgacaoDto } from './create-divulgacao.dto';

export class UpdateDivulgacaoDto extends PartialType(CreateDivulgacaoDto) {}
