import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'; // <-- Adicionado NotFoundException
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { DivulgacaoStatus, StatusAnimal, Prisma } from '@prisma/client'; // <-- Adicionado StatusAnimal e Prisma
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';
import { UploadsService } from 'src/uploads-s3/upload.service'; // <-- ADICIONADO UploadsService

@Injectable()
export class DivulgacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
    private readonly uploadsService: UploadsService, // <-- INJETADO UploadsService
  ) {}

  // Cria uma nova divulgação
  create(createDivulgacaoDto: CreateDivulgacaoDto, imageUrl: string, userId: number) {
    const { localizacao, raca, descricao, castrado, resgate } = createDivulgacaoDto;

    return this.prisma.divulgacao.create({
      data: {
        localizacao,
        raca,
        descricao,
        // Garante que booleanos vindos do FormData sejam tratados corretamente
        castrado: String(castrado) === 'true',
        resgate: String(resgate) === 'true',
        imageUrl: imageUrl, // Salva o nome do arquivo retornado pelo UploadsService
        usuario: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  // Busca todas as divulgações com dados do usuário
  findAll() {
    return this.prisma.divulgacao.findMany({
      include: { usuario: true }, // Inclui nome/email/telefone do usuário que criou
      orderBy: { createdAt: 'desc' },
    });
  }

  // Atualiza o status de uma divulgação e dispara a gamificação se aplicável
  async updateStatus(id: string, status: DivulgacaoStatus) {
    // Usa transação para garantir que a atualização e a gamificação ocorram juntas
    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Busca a divulgação original para comparar o status
      const divulgacaoOriginal = await prisma.divulgacao.findUnique({
        where: { id },
        select: { status: true, usuarioId: true }, // Seleciona apenas o necessário
      });

      if (!divulgacaoOriginal) {
        throw new NotFoundException(`Divulgação com ID ${id} não encontrada.`);
      }

      // Atualiza o status
      const divulgacaoAtualizada = await prisma.divulgacao.update({
        where: { id },
        data: { status },
      });

      // Verifica se o status mudou para REVISADO e se o usuário existe para dar a recompensa
      if (
        divulgacaoAtualizada.status === DivulgacaoStatus.REVISADO &&
        divulgacaoOriginal.status !== DivulgacaoStatus.REVISADO &&
        divulgacaoAtualizada.usuarioId
      ) {
        // Chama a gamificação DENTRO da transação
        await this.gamificacaoService.processarRecompensaPorDivulgacaoAprovada(
          divulgacaoAtualizada.usuarioId,
          prisma, // Passa o cliente da transação
        );
      }
      return divulgacaoAtualizada;
    });
  }

  // Converte uma divulgação em um registro de Animal para adoção
  async convertToAnimal(id: string, convertDto: ConvertDivulgacaoDto) {
    // Busca a divulgação original para obter dados e a imagem
    const divulgacao = await this.prisma.divulgacao.findUnique({
      where: { id },
      include: { usuario: true } // Inclui usuário para possível gamificação ou notificação
    });

    if (!divulgacao) {
      throw new NotFoundException(`Divulgação com ID ${id} não encontrada.`);
    }
    if (!divulgacao.imageUrl) {
        throw new BadRequestException(`Divulgação com ID ${id} não possui imagem para ser convertida.`);
    }

    // Inicia uma transação para garantir atomicidade
    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Cria o novo registro de Animal
      const novoAnimal = await prisma.animal.create({
        data: {
          nome: convertDto.nome,
          raca: convertDto.raca, // Pode usar convertDto.raca se o admin puder ajustar
          descricao: convertDto.descricao, // Pode usar convertDto.descricao
          idade: convertDto.idade,
          especie: convertDto.especie,
          sexo: convertDto.sexo,
          porte: convertDto.porte,
          animalImageUrl: divulgacao.imageUrl, 
          castrado: divulgacao.castrado, 
          status: StatusAnimal.DISPONIVEL,
          isFromDivulgacao: true,
        },
      });

      // Atualiza o status da divulgação para REVISADO
      const divulgacaoAtualizada = await prisma.divulgacao.update({
        where: { id },
        data: { status: DivulgacaoStatus.REVISADO },
      });

      // Processa a recompensa SE o usuário existir e o status ANTERIOR não era REVISADO
      if (
        divulgacaoAtualizada.usuarioId &&
        divulgacao.status !== DivulgacaoStatus.REVISADO
      ) {
        await this.gamificacaoService.processarRecompensaPorDivulgacaoAprovada(
          divulgacaoAtualizada.usuarioId,
          prisma, // Usa o cliente da transação
        );
      }

      // Não deletamos a imagem da divulgação do R2, pois ela foi movida para o Animal.
      // Manter o registro da divulgação no banco pode ser útil para histórico.

      return novoAnimal; // Retorna o animal criado
    });
  }

  // Remove uma divulgação e sua imagem associada do R2
  async remove(id: string) {
    // Usa transação para garantir que a deleção no R2 e no DB ocorram juntas
    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Busca a divulgação para pegar o nome do arquivo da imagem
      const divulgacao = await prisma.divulgacao.findUnique({
        where: { id },
        select: { imageUrl: true }, // Seleciona apenas a URL da imagem
      });

      if (!divulgacao) {
        throw new NotFoundException(`Divulgação com ID ${id} não encontrada.`);
      }

      // Se houver uma imagem associada, deleta do R2
      // Verifica se imageUrl não é null ou undefined antes de tentar deletar
      if (divulgacao.imageUrl) {
        try {
          // Chama o serviço de upload para deletar o arquivo no R2
          await this.uploadsService.deletarArquivo(divulgacao.imageUrl);
        } catch (error) {
          // Loga o erro mas continua para deletar do banco,
          // pode ser que o arquivo já não exista no R2.
          console.error(`Erro ao deletar imagem ${divulgacao.imageUrl} do R2:`, error);
        }
      }

      // Deleta o registro da divulgação no banco DENTRO da transação
      return prisma.divulgacao.delete({ where: { id } });
    });
  }
}

