import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { AnimalService } from 'src/animal/animal.service';
import { DivulgacaoStatus } from 'generated/prisma';

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
        // CORREÇÃO: Usar 'connect' para associar ao utilizador
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
      include: { usuario: true }, // Agora isto vai funcionar
      orderBy: { createdAt: 'desc' },
    });
  }

  // NOVO MÉTODO: Atualiza o status de uma divulgação
  async updateStatus(id: string, status: DivulgacaoStatus) {
    await this.prisma.divulgacao.findUniqueOrThrow({ where: { id } });
    return this.prisma.divulgacao.update({
      where: { id },
      data: { status },
    });
  }

  // NOVO MÉTODO: Converte uma divulgação num animal para adoção
  async convertToAnimal(id: string) {
    const divulgacao = await this.prisma.divulgacao.findUniqueOrThrow({
      where: { id },
    });

    // 1. Cria um novo animal com os dados da divulgação
    const novoAnimal = await this.prisma.animal.create({
      data: {
        nome: 'A Definir', // O admin definirá o nome final no painel
        raca: divulgacao.raca,
        descricao: divulgacao.descricao || 'Sem descrição.',
        animalImageUrl: divulgacao.imageUrl,
        castrado: divulgacao.castrado,
        // O admin precisará de preencher o resto dos detalhes
        especie: 'CAO', // Valor padrão, admin pode alterar
        sexo: 'MACHO',    // Valor padrão, admin pode alterar
        porte: 'MEDIO',   // Valor padrão, admin pode alterar
        idade: 'Não informada', // Valor padrão, admin pode alterar
      },
    });

    // 2. Atualiza o status da divulgação para 'REVISADO'
    await this.updateStatus(id, DivulgacaoStatus.REVISADO);

    return novoAnimal;
  }
}

