import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateConteudoHomeDto } from './dto/update-conteudo-home.dto';

@Injectable()
export class ConteudoHomeService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate() {
    let conteudo = await this.prisma.conteudoHome.findUnique({ where: { id: 1 } });

    if (!conteudo) {
      conteudo = await this.prisma.conteudoHome.create({
        data: {
          id: 1,
          titulo: 'Nossa Missão é Unir Corações e Patas',
          subtitulo: 'Somos uma associação dedicada ao resgate, cuidado e adoção de animais em Porto União, Santa Catarina. Acreditamos que cada animal merece um lar seguro e cheio de amor.',
          itens: JSON.stringify([
            'Resgate de animais em situação de risco.',
            'Cuidados veterinários completos, incluindo vacinação e castração.',
            'Busca por lares responsáveis e amorosos.',
            'Conscientização sobre a posse responsável.',
            'Promoção de eventos e feiras de adoção.',
          ]),
          // Mantemos uma imagem padrão caso nenhuma seja enviada
          imagemUrl: 'default-about.png', 
        },
      });
    }
    return conteudo;
  }

  async update(dto: UpdateConteudoHomeDto, imagemFileName?: string) {
    const data: any = { ...dto };

    // MODIFICADO: Se um novo nome de arquivo foi passado, ele é salvo no banco
    if (imagemFileName) {
      data.imagemUrl = imagemFileName;
    }
    
    return this.prisma.conteudoHome.update({
      where: { id: 1 },
      data,
    });
  }
}