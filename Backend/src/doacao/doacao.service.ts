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
    return this.prisma.doacao.findMany();
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
