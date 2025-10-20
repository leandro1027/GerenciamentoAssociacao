import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { DivulgacaoStatus } from '@prisma/client';
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';

@Injectable()
export class DivulgacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
  ) {}

  // MODIFICADO: Recebe 'imageUrl' como string
  create(createDivulgacaoDto: CreateDivulgacaoDto, imageUrl: string, userId: number) {
    const { localizacao, raca, descricao } = createDivulgacaoDto;

    return this.prisma.divulgacao.create({
      data: {
        localizacao,
        raca,
        descricao,
        castrado: createDivulgacaoDto.castrado === true || (createDivulgacaoDto.castrado as any) === 'true',
        resgate: createDivulgacaoDto.resgate === true || (createDivulgacaoDto.resgate as any) === 'true',
        imageUrl: imageUrl, // Salva o nome do arquivo vindo da Cloudflare
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

  async updateStatus(id: string, status: DivulgacaoStatus) {
    return this.prisma.$transaction(async (prisma) => {
      const divulgacaoOriginal = await prisma.divulgacao.findUniqueOrThrow({ where: { id } });
      const divulgacaoAtualizada = await prisma.divulgacao.update({ where: { id }, data: { status } });
      
      if (
        divulgacaoAtualizada.status === DivulgacaoStatus.REVISADO &&
        divulgacaoOriginal.status !== DivulgacaoStatus.REVISADO &&
        divulgacaoAtualizada.usuarioId
      ) {
        await this.gamificacaoService.processarRecompensaPorDivulgacaoAprovada(
          divulgacaoAtualizada.usuarioId,
          prisma,
        );
      }
      return divulgacaoAtualizada;
    });
  }

  async convertToAnimal(id: string, convertDto: ConvertDivulgacaoDto) {
    const divulgacao = await this.prisma.divulgacao.findUniqueOrThrow({ where: { id } });
    
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
    
    await this.updateStatus(id, DivulgacaoStatus.REVISADO);
    return novoAnimal;
  }

  async remove(id: string) {
    // TODO: Antes de deletar, buscar o nome da foto no DB para deletá-la da Cloudflare R2
    await this.prisma.divulgacao.findUniqueOrThrow({ where: { id } });
    return this.prisma.divulgacao.delete({ where: { id } });
  }
}