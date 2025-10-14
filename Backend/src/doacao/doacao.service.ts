import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto';
import { StatusDoacao } from '@prisma/client';

@Injectable()
export class DoacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
  ) {}

  // MÉTODO ALTERADO: Agora recebe o arquivo e salva seu caminho
  async create(
    createDoacaoDto: CreateDoacaoDto,
    file: Express.Multer.File,
  ) {
    // IMPORTANTE: Dados de um FormData vêm como string.
    // Precisamos convertê-los para os tipos corretos.
    const valorNumerico = parseFloat(createDoacaoDto.valor as any);
    const usuarioIdNumerico = createDoacaoDto.usuarioId
      ? parseInt(createDoacaoDto.usuarioId as any, 10)
      : null;

    return this.prisma.doacao.create({
      data: {
        ...createDoacaoDto,
        valor: valorNumerico,
        usuarioId: usuarioIdNumerico,
        comprovanteUrl: file.path, // Salva o caminho do arquivo (ex: 'uploads/comprovante-123.png')
      },
    });
  }

  findAll() {
    return this.prisma.doacao.findMany({
      include: {
        usuario: true,
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const doacao = await this.prisma.doacao.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!doacao) {
      throw new NotFoundException(`Doação com id ${id} não encontrada.`);
    }

    return doacao;
  }

  async updateStatus(
    id: number,
    updateDoacaoStatusDto: UpdateDoacaoStatusDto,
  ) {
    // Primeiro, busca a doação original para ter os dados
    const doacaoOriginal = await this.findOne(id);

    const doacaoAtualizada = await this.prisma.doacao.update({
      where: { id },
      data: {
        status: updateDoacaoStatusDto.status,
      },
      include: {
            usuario: true, // Garante que os dados do usuário relacionado sejam incluídos na resposta
        },
    });

    // Lógica da Gamificação: acionada apenas na transição para CONFIRMADA
    if (
      doacaoAtualizada.status === StatusDoacao.CONFIRMADA &&
      doacaoOriginal.status !== StatusDoacao.CONFIRMADA && // Evita adicionar pontos múltiplas vezes
      doacaoAtualizada.usuarioId
    ) {
      // 1. Atribuir pontos
      const pontosGanhos = Math.floor(doacaoAtualizada.valor);
      await this.gamificacaoService.adicionarPontos(
        doacaoAtualizada.usuarioId,
        pontosGanhos,
      );

      // 2. Verificar conquista de primeira doação
      const totalDoacoesConfirmadas = await this.prisma.doacao.count({
        where: {
          usuarioId: doacaoAtualizada.usuarioId,
          status: StatusDoacao.CONFIRMADA,
        },
      });

      if (totalDoacoesConfirmadas === 1) {
        await this.gamificacaoService.verificarEAdicionarConquista(
          doacaoAtualizada.usuarioId,
          'Primeiro Apoiador',
        );
      }
    }

    return doacaoAtualizada;
  }

  async update(id: number, updateDoacaoDto: UpdateDoacaoDto) {
    await this.findOne(id);
    return this.prisma.doacao.update({
      where: { id },
      data: updateDoacaoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.doacao.delete({
      where: { id },
    });
  }
}