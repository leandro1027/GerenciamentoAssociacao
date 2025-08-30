import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { AnimalService } from 'src/animal/animal.service';
import { DivulgacaoStatus } from '@prisma/client';

@Injectable()
export class DivulgacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly animalService: AnimalService,) {}

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

  async convertToAnimal(id: string) {
    const divulgacao = await this.prisma.divulgacao.findUniqueOrThrow({
      where: { id },
    });

    // 1. Cria um novo animal com os dados da divulgação
    const novoAnimal = await this.prisma.animal.create({
      data: {
        nome: `A Definir (${divulgacao.raca})`, // Nome provisório
        raca: divulgacao.raca,
        descricao: divulgacao.descricao || 'Sem descrição.',
        animalImageUrl: divulgacao.imageUrl,
        castrado: divulgacao.castrado,
        // O admin precisará preencher o resto dos detalhes no painel "Gerir Animais"
        especie: 'CAO', // Valor padrão
        sexo: 'MACHO',    // Valor padrão
        porte: 'MEDIO',   // Valor padrão
        idade: 'A apurar', // Valor padrão
      },
    });

    // 2. DELETA a divulgação original após a conversão
    await this.prisma.divulgacao.delete({ where: { id } });

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

