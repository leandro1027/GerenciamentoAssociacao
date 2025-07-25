import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';
import { StatusAdocao, StatusAnimal } from 'generated/prisma';

@Injectable()
export class AdocoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdocaoDto: CreateAdocoeDto, userId: number) {
    const { animalId, tipoMoradia, outrosAnimais, tempoDisponivel, motivoAdocao } = createAdocaoDto;

    // Verifica se já existe um pedido do mesmo utilizador para o mesmo animal
    const existingAdoption = await this.prisma.adocao.findFirst({
      where: {
        usuarioId: userId,
        animalId: animalId,
      },
    });

    if (existingAdoption) {
      throw new ConflictException('Você já solicitou a adoção deste animal.');
    }

    return this.prisma.adocao.create({
      data: {
        animalId,
        usuarioId: userId,
        tipoMoradia,
        outrosAnimais,
        tempoDisponivel,
        motivoAdocao,
      },
    });
  }

  findAllForUser(userId: number) {
    return this.prisma.adocao.findMany({
      where: { usuarioId: userId },
      include: {
        animal: true, // Inclui os detalhes do animal em cada pedido
      },
      orderBy: {
        dataSolicitacao: 'desc',
      },
    });
  }

  findAllForAdmin() {
    return this.prisma.adocao.findMany({
      include: {
        animal: true,   // Inclui detalhes do animal
        usuario: true,  // Inclui detalhes do utilizador
      },
      orderBy: {
        dataSolicitacao: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: StatusAdocao) {
    const adocao = await this.prisma.adocao.findUnique({
        where: { id },
    });

    if (!adocao) {
        throw new NotFoundException(`Pedido de adoção com ID "${id}" não encontrado.`);
    }

    // Se a adoção for aprovada, atualiza o status do animal também.
    // Usamos uma transação para garantir que ambas as operações ocorram com sucesso.
    if (status === StatusAdocao.APROVADA) {
      return this.prisma.$transaction(async (prisma) => {
        // 1. Atualiza o pedido de adoção
        const updatedAdocao = await prisma.adocao.update({
          where: { id },
          data: { status, dataFinalizacao: new Date() },
        });

        // 2. Atualiza o status do animal para ADOTADO
        await prisma.animal.update({
          where: { id: adocao.animalId },
          data: { status: StatusAnimal.ADOTADO, disponivel: false },
        });

        return updatedAdocao;
      });
    }

    // Para outros status (RECUSADA, etc.), apenas atualiza o pedido
    return this.prisma.adocao.update({
      where: { id },
      data: { status },
    });
  }
}

