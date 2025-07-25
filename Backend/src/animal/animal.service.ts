import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Animal, Especie, Sexo, Porte, StatusAnimal } from 'generated/prisma';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AnimalService {
  constructor (private readonly prisma:PrismaService){}

  create(createAnimalDto: CreateAnimalDto, file: Express.Multer.File) {
    const animalImageUrl = `/uploads/${file.filename}`;
    return this.prisma.animal.create({
      data: {
        ...createAnimalDto,
        animalImageUrl: animalImageUrl,
      },
    });
  }

  // MÉTODO ATUALIZADO PARA ACEITAR FILTROS
  findAll(filters: { especie?: Especie; sexo?: Sexo; porte?: Porte; nome?: string }) {
    const where: Prisma.AnimalWhereInput = {
      status: StatusAnimal.DISPONIVEL, // Sempre retorna apenas os disponíveis
    };

    if (filters.especie) {
      where.especie = filters.especie;
    }
    if (filters.sexo) {
      where.sexo = filters.sexo;
    }
    if (filters.porte) {
      where.porte = filters.porte;
    }
    if (filters.nome) {
      // CORREÇÃO: A propriedade 'mode' foi removida para ser compatível com SQLite.
      where.nome = {
        contains: filters.nome,
      };
    }

    return this.prisma.animal.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: {id},
    });

    if(!animal){
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`)
    }

    return animal;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findOne(id);
    return this.prisma.animal.update({
      where: {id},
      data: updateAnimalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.animal.delete({
      where: {id},
    });
  }
}