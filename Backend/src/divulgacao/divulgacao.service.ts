import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { DivulgacaoStatus } from '@prisma/client';
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service'; // NOVO: Importa o serviço

@Injectable()
export class DivulgacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService, // NOVO: Injeta o serviço
    // O AnimalService não é usado aqui, pode ser removido se não for usado em outros métodos
  ) {}

  create(createDivulgacaoDto: CreateDivulgacaoDto, file: Express.Multer.File, userId: number) {
    const imageUrl = `/uploads/${file.filename}`;
    
    const { localizacao, raca, descricao } = createDivulgacaoDto;

    return this.prisma.divulgacao.create({
      data: {
        localizacao,
        raca,
        descricao,
        castrado: createDivulgacaoDto.castrado === true || (createDivulgacaoDto.castrado as any) === 'true',
        resgate: createDivulgacaoDto.resgate === true || (createDivulgacaoDto.resgate as any) === 'true',
        imageUrl: imageUrl,
        usuario: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.divulgacao.findMany({
      include: { usuario: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- MÉTODO ATUALIZADO COM A LÓGICA DE GAMIFICAÇÃO ---
  async updateStatus(id: string, status: DivulgacaoStatus) {
    // Usamos uma transação para garantir que ambas as operações (atualização e gamificação) funcionem
    return this.prisma.$transaction(async (prisma) => {
      // 1. Busca a divulgação original para saber o status antigo e o ID do usuário
      const divulgacaoOriginal = await prisma.divulgacao.findUniqueOrThrow({
        where: { id },
      });

      // 2. Atualiza o status da divulgação
      const divulgacaoAtualizada = await prisma.divulgacao.update({
        where: { id },
        data: { status },
      });

      // 3. Verifica se a condição para gamificação foi atendida
      if (
        divulgacaoAtualizada.status === DivulgacaoStatus.REVISADO && // Se o novo status for APROVADO
        divulgacaoOriginal.status !== DivulgacaoStatus.REVISADO &&  // E o status antigo NÃO ERA APROVADO
        divulgacaoAtualizada.usuarioId
      ) {
        // Chama o método no GamificacaoService para dar os pontos e a conquista
        await this.gamificacaoService.processarRecompensaPorDivulgacaoAprovada(
          divulgacaoAtualizada.usuarioId,
          prisma, // Passa o cliente da transação
        );
      }
      
      return divulgacaoAtualizada;
    });
  }

  async convertToAnimal(id: string, convertDto: ConvertDivulgacaoDto) {
    const divulgacao = await this.prisma.divulgacao.findUniqueOrThrow({
      where: { id },
    });
    
    const novoAnimal = await this.prisma.animal.create({
      data: {
        nome: convertDto.nome,
        raca: convertDto.raca,
        descricao: convertDto.descricao,
        idade: convertDto.idade,
        especie: convertDto.especie,
        sexo: convertDto.sexo,
        porte: convertDto.porte,
        animalImageUrl: divulgacao.imageUrl,
        castrado: divulgacao.castrado,
      },
    });
    
    // ATENÇÃO: Se converter para animal também conta como "aprovação",
    // a lógica da gamificação também deveria ser adicionada aqui!
    // Se o status aqui também muda para REVISADO, a gamificação será acionada.
    await this.updateStatus(id, DivulgacaoStatus.REVISADO);

    return novoAnimal;
  }

  async remove(id: string) {
    await this.prisma.divulgacao.findUniqueOrThrow({ where: { id } });
    return this.prisma.divulgacao.delete({ where: { id } });
  }
}