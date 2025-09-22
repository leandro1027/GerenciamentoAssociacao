import { PartialType } from '@nestjs/mapped-types';
import { CreateGamificacaoDto } from './create-gamificacao.dto';

export class UpdateGamificacaoDto extends PartialType(CreateGamificacaoDto) {}
