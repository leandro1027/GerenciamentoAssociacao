import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracaoService {
  constructor(private readonly prisma: PrismaService) {}

  // Busca a configuração (sempre a de id: 1)
  async find() {
    const configuracao = await this.prisma.configuracao.findUnique({
      where: { id: 1 },
    });
    if (!configuracao) {
      // Isso não deve acontecer se o seed script rodou, mas é uma segurança
      throw new NotFoundException('Configuração não encontrada.');
    }
    return configuracao;
  }

  // Atualiza a configuração (sempre a de id: 1)
  async update(updateConfiguracaoDto: UpdateConfiguracaoDto) {
    // Primeiro, garante que a configuração existe antes de tentar atualizar
    await this.find(); 
    
    return this.prisma.configuracao.update({
      where: { id: 1 },
      data: updateConfiguracaoDto,
    });
  }
}