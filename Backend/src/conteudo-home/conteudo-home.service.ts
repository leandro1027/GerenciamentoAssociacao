import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateConteudoHomeDto } from './dto/update-conteudo-home.dto';
import { ConfigService } from '@nestjs/config'; // ADICIONE ESTA IMPORT

@Injectable()
export class ConteudoHomeService {
  private readonly r2PublicDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService, // ADICIONE ESTA INJEÇÃO
  ) {
    // Obtém o domínio público do R2 do environment
    this.r2PublicDomain = this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';
  }

  /**
   * Converte nome do arquivo para URL completa do R2
   */
  private buildImageUrl(fileName: string | null): string | null {
    if (!fileName) return null;
    if (fileName.startsWith('http')) return fileName; // Já é URL completa
    return this.r2PublicDomain ? `${this.r2PublicDomain}/${fileName}` : fileName;
  }

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
          imagemUrl: 'default-about.png', 
        },
      });
    }

    // ✅ TRANSFORMA: Converte nome do arquivo para URL completa
    return {
      ...conteudo,
      imagemUrl: this.buildImageUrl(conteudo.imagemUrl)
    };
  }

  async update(dto: UpdateConteudoHomeDto, imagemFileName?: string) {
    const data: any = { ...dto };

    // Se um novo nome de arquivo foi passado, ele é salvo no banco
    if (imagemFileName) {
      data.imagemUrl = imagemFileName;
    }
    
    const conteudoAtualizado = await this.prisma.conteudoHome.update({
      where: { id: 1 },
      data,
    });

    // ✅ TRANSFORMA: Converte nome do arquivo para URL completa
    return {
      ...conteudoAtualizado,
      imagemUrl: this.buildImageUrl(conteudoAtualizado.imagemUrl)
    };
  }
}