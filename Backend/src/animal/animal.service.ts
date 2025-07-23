import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusAnimal } from 'generated/prisma';

@Injectable()
export class AnimalService {
  constructor (private readonly prisma:PrismaService){}

  create(createAnimalDto: CreateAnimalDto) {
    return this.prisma.animal.create({
      data: createAnimalDto,
    });
  }

  findAll(disponivel?: boolean) {
    const whereClause = disponivel ? { status: StatusAnimal.DISPONIVEL } : {};

    return this.prisma.animal.findMany({
      where: whereClause,
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