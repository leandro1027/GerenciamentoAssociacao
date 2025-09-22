import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Importação necessária

@Injectable()
export class DoacaoService {
  constructor (private readonly prisma:PrismaService){}

  create(createDoacaoDto: CreateDoacaoDto) {
    const { valor, tipo, usuarioId } = createDoacaoDto;

    // Prepara os dados básicos da doação
    const data: Prisma.DoacaoCreateInput = {
      valor,
      tipo,
    };

    // Se um usuarioId foi enviado, conecta a doação a esse usuário
    if (usuarioId) {
      data.usuario = {
        connect: {
          id: usuarioId,
        },
      };
    }

    // Cria o registro no banco. Se não houver usuarioId, será uma doação anônima.
    return this.prisma.doacao.create({ data });
  }

  findAll() {
    return this.prisma.doacao.findMany({
      include: {
        usuario: true, // Inclui o objeto do utilizador (pode ser nulo para doações anônimas)
      },
      orderBy: {
        data: 'desc', // Ordena as doações da mais recente para a mais antiga
      }
    });
  }

  async findOne(id: number) {
    const doacao = await this.prisma.doacao.findUnique({
      where: {id},
    });

    if(!doacao){
      throw new NotFoundException(`Doação com id ${id} não encontrada.`)
    }

    return doacao;
  }

  async update(id: number, updateDoacaoDto: UpdateDoacaoDto) {
    await this.findOne(id);

    return this.prisma.doacao.update({
      where: {id},
      data: updateDoacaoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.doacao.delete({
      where: {id},
    });
  }
}
