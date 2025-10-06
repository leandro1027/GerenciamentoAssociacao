import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalComunitarioDto } from './create-animais-comunitario.dto';

export class UpdateAnimalComunitarioDto extends PartialType(
  CreateAnimalComunitarioDto,
) {}