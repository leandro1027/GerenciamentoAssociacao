import { PartialType } from '@nestjs/mapped-types';
import { CreateAdocoeDto } from './create-adocoe.dto';

export class UpdateAdocoeDto extends PartialType(CreateAdocoeDto) {}
