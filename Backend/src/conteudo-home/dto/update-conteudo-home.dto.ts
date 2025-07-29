import { PartialType } from '@nestjs/mapped-types';
import { CreateConteudoHomeDto } from './create-conteudo-home.dto';

// Em: Backend/src/conteudo-home/dto/update-conteudo-home.dto.ts

export class UpdateConteudoHomeDto {
    titulo: string;
    subtitulo: string;
    itens: string; // Receberemos como uma string JSON do frontend
}

