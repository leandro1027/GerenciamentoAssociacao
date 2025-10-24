import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';
import { StatusAdocao, StatusAnimal, Prisma } from '@prisma/client'; // Adicionado Prisma
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';

@Injectable()
export class AdocoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
  ) {}

  async create(createAdocaoDto: CreateAdocoeDto, userId: number) {
    const { animalId, tipoMoradia, outrosAnimais, tempoDisponivel, motivoAdocao } = createAdocaoDto;

    // Verifica se o animal existe e está disponível
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${animalId}" não encontrado.`);
    }
    if (animal.status !== StatusAnimal.DISPONIVEL) {
      throw new ConflictException('Este animal não está mais disponível para adoção.');
    }


    // Verifica se já existe um pedido PENDENTE do mesmo utilizador para o mesmo animal
    const existingPendingAdoption = await this.prisma.adocao.findFirst({
      where: {
        usuarioId: userId,
        animalId: animalId,
        status: { in: [StatusAdocao.SOLICITADA, StatusAdocao.EM_ANALISE] }, // Verifica apenas pendentes
      },
    });

    if (existingPendingAdoption) {
      throw new ConflictException('Você já tem uma solicitação pendente para este animal.');
    }

    return this.prisma.adocao.create({
      data: {
        animalId,
        usuarioId: userId,
        tipoMoradia,
        outrosAnimais,
        tempoDisponivel,
        motivoAdocao,
        status: StatusAdocao.SOLICITADA, // Define o status inicial
      },
      include: { animal: true, usuario: true } // Retorna dados completos
    });
  }


  findAllForUser(userId: number) {
    return this.prisma.adocao.findMany({
      where: { usuarioId: userId },
      include: {
        // Inclui detalhes do animal, importante ter isFromDivulgacao aqui
        animal: true,
      },
    });
  }


  findAllForAdmin() {
    return this.prisma.adocao.findMany({
      include: {
        animal: true, // Inclui detalhes do animal
        usuario: { // Inclui detalhes do utilizador (seleciona campos para evitar senha)
          select: { id: true, nome: true, email: true, telefone: true }
        },
      },
    });
  }

  async updateStatus(id: string, status: StatusAdocao) {
    // Usa $transaction para garantir atomicidade
    return this.prisma.$transaction(async (prisma) => {
      // 1. Busca a adoção E o animal associado
      const adocao = await prisma.adocao.findUnique({
        where: { id },
        include: { animal: true }, // Inclui o animal para verificar o status dele
      });

      // Se a adoção não existe, lança erro
      if (!adocao) {
        throw new NotFoundException(`Pedido de adoção com ID "${id}" não encontrado.`);
      }
      // Se o animal associado não existe (raro, mas possível), lança erro
      if (!adocao.animal) {
        throw new NotFoundException(`Animal associado à adoção ${id} não encontrado (ID: ${adocao.animalId}).`);
      }

      const statusAtualAdocao = adocao.status;
      const statusAtualAnimal = adocao.animal.status;
      const animalId = adocao.animalId;
      const usuarioIdAdocao = adocao.usuarioId;

      // --- LÓGICA DE APROVAÇÃO ---
      if (status === StatusAdocao.APROVADA) {
        // Verifica se o ANIMAL já foi adotado (por ESTA ou outra adoção)
        if (statusAtualAnimal === StatusAnimal.ADOTADO) {
           // Se a adoção ATUAL já está aprovada, não faz nada (idempotência)
           if (statusAtualAdocao === StatusAdocao.APROVADA) {
               console.warn(`Adoção ${id} já estava aprovada.`);
               // Retorna a adoção existente com os includes necessários
               return prisma.adocao.findUnique({ where: { id }, include: { animal: true, usuario: true }});
           } else {
               // Se o animal está adotado, mas esta adoção NÃO era a aprovada, lança conflito
               throw new ConflictException(`O animal ${adocao.animal.nome} (ID: ${animalId}) já foi adotado por outra solicitação.`);
           }
        }

        // Se o animal está DISPONÍVEL, podemos aprovar
        if (statusAtualAnimal === StatusAnimal.DISPONIVEL) {
          // Marca o ANIMAL como ADOTADO
          await prisma.animal.update({
            where: { id: animalId },
            data: { status: StatusAnimal.ADOTADO },
          });

          // (Opcional, mas recomendado) Recusa automaticamente OUTROS pedidos PENDENTES para o MESMO animal
          await prisma.adocao.updateMany({
            where: {
              animalId: animalId,
              id: { not: id }, // Não atualiza o pedido atual
              status: { in: [StatusAdocao.SOLICITADA, StatusAdocao.EM_ANALISE] } // Apenas os pendentes
            },
            data: { status: StatusAdocao.RECUSADA }
          });

           // Processa a recompensa SÓ SE a adoção estava pendente antes
          if (statusAtualAdocao !== StatusAdocao.APROVADA && usuarioIdAdocao) {
             await this.gamificacaoService.processarRecompensaPorAdocao(
               usuarioIdAdocao,
               prisma, // Passa o cliente da transação
             );
          }

        } else {
           // Se o animal não está nem DISPONIVEL nem ADOTADO (estado inesperado)
            throw new ConflictException(`O animal ${adocao.animal.nome} (ID: ${animalId}) não está em um estado que permita adoção (Status: ${statusAtualAnimal}).`);
        }

      // --- LÓGICA PARA OUTROS STATUS (RECUSADA, EM_ANALISE, SOLICITADA) ---
      } else if (status === StatusAdocao.RECUSADA || status === StatusAdocao.EM_ANALISE || status === StatusAdocao.SOLICITADA) {
        // Verifica se a adoção que está sendo modificada ERA a que tinha APROVADO o animal
        if (statusAtualAdocao === StatusAdocao.APROVADA && statusAtualAnimal === StatusAnimal.ADOTADO) {
            // Verifica se existe ALGUMA OUTRA adoção APROVADA para este animal
            const outraAdocaoAprovada = await prisma.adocao.findFirst({
                where: {
                    animalId: animalId,
                    status: StatusAdocao.APROVADA,
                    id: { not: id } // Exclui a adoção atual da busca
                }
            });

            // Se NÃO existir NENHUMA outra adoção aprovada,
            // então podemos seguramente voltar o status do ANIMAL para DISPONIVEL
            if (!outraAdocaoAprovada) {
                await prisma.animal.update({
                    where: { id: animalId },
                    data: { status: StatusAnimal.DISPONIVEL },
                });
            }
            // Se existir outra adoção aprovada, não fazemos nada no status do animal.
        }
         // Se a adoção atual não era a aprovada, ou o animal não estava adotado,
         // simplesmente mudamos o status da adoção sem afetar o animal.
      }

      // --- ATUALIZAÇÃO FINAL ---
      // Atualiza o status da adoção atual independentemente do fluxo acima
      const adocaoAtualizada = await prisma.adocao.update({
        where: { id },
        data: { status: status, dataFinalizacao: (status === StatusAdocao.APROVADA || status === StatusAdocao.RECUSADA) ? new Date() : null }, // Atualiza data de finalização
        include: { animal: true, usuario: { select: { id: true, nome: true, email: true, telefone: true } } }, // Retorna dados completos para o frontend
      });

      return adocaoAtualizada;

    }); // Fim da transação
  }
}
