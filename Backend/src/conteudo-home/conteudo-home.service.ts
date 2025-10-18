// Em: Backend/src/conteudo-home/conteudo-home.service.ts

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
          imagemUrl: '/uploads/default-about.png', 
        },
      });
    }
    return conteudo;
  }

  async update(dto: UpdateConteudoHomeDto, file?: Express.Multer.File) {
    const data: any = { ...dto };

    if (file) {
      data.imagemUrl = `/uploads/${file.filename}`;
    }
    
    return this.prisma.conteudoHome.update({
      where: { id: 1 },
      data,
    });
  }
}
