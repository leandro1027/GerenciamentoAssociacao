import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracaoService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const configuracao = await this.prisma.configuracao.findUnique({
      where: { id: 1 },
    });
    if (!configuracao) {
      throw new NotFoundException('Configuração não encontrada.');
    }
    return configuracao;
  }

  async update(updateConfiguracaoDto: UpdateConfiguracaoDto) {
    await this.find();
    return this.prisma.configuracao.update({
      where: { id: 1 },
      data: updateConfiguracaoDto,
    });
  }

  // 🔹 Verifica se a gamificação está ativa
  async isGamificacaoAtiva(): Promise<boolean> {
    const config = await this.find();
    return config.gamificacaoAtiva;
  }
}