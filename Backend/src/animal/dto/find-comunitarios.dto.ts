import { IsOptional, IsString } from 'class-validator';

export class FindComunitariosDto {
  @IsString()
  @IsOptional() // Torna o filtro de localização opcional
  localizacaoComunitaria?: string;
}

