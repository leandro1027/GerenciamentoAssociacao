import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoacaoService {
  constructor (private readonly prisma:PrismaService){}

  create(createDoacaoDto: CreateDoacaoDto) {
    return this.prisma.doacao.create({data: createDoacaoDto,
    });
  }

  findAll() {
    // A CORREÇÃO ESTÁ AQUI: Adicionamos o 'include'
    return this.prisma.doacao.findMany({
      include: {
        usuario: true, // Isto diz ao Prisma para incluir o objeto do utilizador relacionado
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
