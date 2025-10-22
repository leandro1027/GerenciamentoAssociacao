import { IsString, IsOptional, IsJSON } from 'class-validator';

export class UpdateConteudoHomeDto {
  @IsString()
  @IsOptional() 
  titulo?: string;

  @IsString()
  @IsOptional()
  subtitulo?: string;

  @IsOptional()
  itens?: string; 
}