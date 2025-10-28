import { IsOptional, IsString } from 'class-validator';

export class FindComunitariosDto {
  @IsString()
  @IsOptional()
  search?: string; // 'search' para filtros de nome ou endereço
}

