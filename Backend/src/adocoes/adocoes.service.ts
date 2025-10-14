import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';
import { StatusAdocao, StatusAnimal } from '@prisma/client';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service'; // 1. IMPORTAR O SERVIÇO DE GAMIFICAÇÃO

@Injectable()
export class AdocoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService, // 2. INJETAR O SERVIÇO NO CONSTRUTOR
  ) {}

  /**
   * Cria uma nova solicitação de adoção.
   */
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

  /**
   * Busca todas as solicitações de adoção para um usuário específico.
   */
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

  /**
   * Busca todas as solicitações de adoção para o painel de administração.
   */
  findAllForAdmin() {
    return this.prisma.adocao.findMany({
      include: {
        animal: true, // Inclui detalhes do animal
        usuario: true, // Inclui detalhes do utilizador
      },
      orderBy: {
        dataSolicitacao: 'desc',
      },
    });
  }

  /**
   * Atualiza o status de uma solicitação de adoção.
   * Se o novo status for 'APROVADA', aciona a lógica de gamificação.
   */
  async updateStatus(id: string, status: StatusAdocao) {
    const adocao = await this.prisma.adocao.findUnique({
      where: { id },
    });

    if (!adocao) {
      throw new NotFoundException(`Pedido de adoção com ID "${id}" não encontrado.`);
    }

    // A lógica de gamificação só deve ser acionada na TRANSIÇÃO para APROVADA.
    // Isso evita que a recompensa seja dada múltiplas vezes caso a ação seja repetida.
    if (adocao.status !== StatusAdocao.APROVADA && status === StatusAdocao.APROVADA) {
      
      // Usamos uma transação para garantir que todas as operações (atualizar adoção,
      // atualizar animal e dar pontos/medalhas) aconteçam com sucesso, ou nenhuma delas.
      return this.prisma.$transaction(async (prisma) => {
        // 1. Atualiza o pedido de adoção
        const updatedAdocao = await prisma.adocao.update({
          where: { id },
          data: { status, dataFinalizacao: new Date() },
        });

        // 2. Atualiza o status do animal para ADOTADO e o torna indisponível
        await prisma.animal.update({
          where: { id: adocao.animalId },
          data: { status: StatusAnimal.ADOTADO, disponivel: false },
        });

        // 3. ACIONA O GATILHO DE GAMIFICAÇÃO!
        // Passamos o ID do usuário e o cliente da transação para o serviço de gamificação.
        await this.gamificacaoService.processarRecompensaPorAdocao(
          updatedAdocao.usuarioId,
          prisma,
        );

        return updatedAdocao;
      });
    }

    // Para qualquer outra atualização de status (ex: EM_ANALISE, RECUSADA),
    // apenas atualiza o pedido de adoção sem acionar a gamificação.
    return this.prisma.adocao.update({
      where: { id },
      data: { status },
    });
  }
}