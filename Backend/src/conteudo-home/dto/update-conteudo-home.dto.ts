import { PartialType } from '@nestjs/mapped-types';
import { CreateConteudoHomeDto } from './create-conteudo-home.dto';

export class UpdateConteudoHomeDto {
    titulo: string;
    subtitulo: string;
    itens: string;
}

