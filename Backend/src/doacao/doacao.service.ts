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

  // MODIFICADO: A assinatura do método agora espera uma string 'comprovanteFileName'
  async create(
    createDoacaoDto: CreateDoacaoDto,
    comprovanteFileName: string,
  ) {
    const valorNumerico = parseFloat(createDoacaoDto.valor as any);
    const usuarioIdNumerico = createDoacaoDto.usuarioId
      ? parseInt(createDoacaoDto.usuarioId as any, 10)
      : null;

    return this.prisma.doacao.create({
      data: {
        ...createDoacaoDto,
        valor: valorNumerico,
        usuarioId: usuarioIdNumerico,
        comprovanteUrl: comprovanteFileName, // Salva o nome do arquivo vindo da Cloudflare
      },
    });
  }

  findAll() {
    return this.prisma.doacao.findMany({
      include: { usuario: true },
      orderBy: { data: 'desc' },
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

  async updateStatus(id: number, updateDoacaoStatusDto: UpdateDoacaoStatusDto) {
    const doacaoOriginal = await this.findOne(id);
    const doacaoAtualizada = await this.prisma.doacao.update({
      where: { id },
      data: { status: updateDoacaoStatusDto.status },
    });

    if (
      doacaoAtualizada.status === StatusDoacao.CONFIRMADA &&
      doacaoOriginal.status !== StatusDoacao.CONFIRMADA &&
      doacaoAtualizada.usuarioId
    ) {
      await this.gamificacaoService.processarRecompensaPorDoacao(
        doacaoAtualizada.usuarioId,
        doacaoAtualizada.valor,
      );
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
    // TODO: Antes de deletar, buscar o nome do comprovante no DB para deletá-lo da Cloudflare R2
    return this.prisma.doacao.delete({
      where: { id },
    });
  }
}