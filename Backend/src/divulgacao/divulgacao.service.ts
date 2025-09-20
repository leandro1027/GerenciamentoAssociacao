import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { AnimalService } from 'src/animal/animal.service';
import { DivulgacaoStatus } from '@prisma/client';
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';

@Injectable()
export class DivulgacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly animalService: AnimalService,
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

  // Para o painel admin
  findAll() {
    return this.prisma.divulgacao.findMany({
      include: { usuario: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  //Atualiza o status de uma divulgação
  async updateStatus(id: string, status: DivulgacaoStatus) {
    await this.prisma.divulgacao.findUniqueOrThrow({ where: { id } });
    return this.prisma.divulgacao.update({
      where: { id },
      data: { status },
    });
  }

  async convertToAnimal(id: string, convertDto: ConvertDivulgacaoDto) {
    const divulgacao = await this.prisma.divulgacao.findUniqueOrThrow({
      where: { id },
    });

    // 1. Cria um novo animal com os dados do formulário
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

    // 2. ATUALIZA o status da divulgação original em vez de apagar
    await this.prisma.divulgacao.update({
      where: { id },
      data: { status: DivulgacaoStatus.REVISADO }, // <-- LÓGICA CORRIGIDA
    });

    return novoAnimal;
  }

  async remove(id: string) {
    const divulgacao = await this.prisma.divulgacao.findUnique({ where: { id } });
    if (!divulgacao) {
      throw new NotFoundException(`Divulgação com ID "${id}" não encontrada.`);
    }
    return this.prisma.divulgacao.delete({ where: { id } });
  }
}
