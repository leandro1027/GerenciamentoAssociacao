// src/doacao/doacao.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto';
import { StatusDoacao } from 'generated/prisma';
// import { GamificacaoService } from 'src/gamificacao/gamificacao.service'; // Descomente quando tiver o serviço

@Injectable()
export class DoacaoService {
  // Injetamos o PrismaService e o GamificacaoService
  constructor(
    private readonly prisma: PrismaService,
    // private readonly gamificacaoService: GamificacaoService, // Descomente quando tiver o serviço
  ) {}

  /**
   * Cria uma nova doação com status PENDENTE por padrão.
   */
  create(createDoacaoDto: CreateDoacaoDto) {
    return this.prisma.doacao.create({
      data: createDoacaoDto,
    });
  }

  /**
   * NOVO: Atualiza o status de uma doação (usado pelo Admin).
   * Se o status for alterado para CONFIRMADO, aciona a lógica de gamificação.
   */
 async updateStatus(id: number, updateDoacaoStatusDto: UpdateDoacaoStatusDto) {
    // 1. Garante que a doação existe
    await this.findOne(id);

    // 2. Atualiza o status passando o DTO diretamente para o data
    const doacaoAtualizada = await this.prisma.doacao.update({
      where: { id },
      data: updateDoacaoStatusDto, // <-- MUDANÇA PRINCIPAL AQUI
    });

    // 3. Lógica de Gamificação Condicional
    if (
      doacaoAtualizada.status === StatusDoacao.CONFIRMADA &&
      doacaoAtualizada.usuarioId
    ) {
      console.log(
        `[Gamificação] Iniciando processo para usuário ${doacaoAtualizada.usuarioId} com valor ${doacaoAtualizada.valor}`,
      );
      // Chame seu serviço de gamificação aqui
      // await this.gamificacaoService.processarDoacao(
      //   doacaoAtualizada.usuarioId,
      //   doacaoAtualizada.valor,
      // );
    }

    return doacaoAtualizada;
  }


  findAll() {
    return this.prisma.doacao.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
          }
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const doacao = await this.prisma.doacao.findUnique({
      where: { id },
    });

    if (!doacao) {
      throw new NotFoundException(`Doação com id ${id} não encontrada.`);
    }

    return doacao;
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