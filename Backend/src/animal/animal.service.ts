import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Especie, Sexo, Porte, StatusAnimal } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { FindComunitariosDto } from './dto/find-comunitarios.dto';

@Injectable()
export class AnimalService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAnimalDto: CreateAnimalDto, file: Express.Multer.File) {
    const animalImageUrl = `/uploads/${file.filename}`;
    const { castrado, comunitario, ...restOfDto } = createAnimalDto;

    return this.prisma.animal.create({
      data: {
        ...restOfDto,
        castrado: String(castrado) === 'true',
        comunitario: String(comunitario) === 'true',
        animalImageUrl: animalImageUrl,
      },
    });
  }

  findAll(filters: {
    especie?: Especie;
    sexo?: Sexo;
    porte?: Porte;
    nome?: string;
    context?: string; // <-- Adicionamos o parâmetro de contexto
}) {
    const where: Prisma.AnimalWhereInput = {
        status: StatusAnimal.DISPONIVEL,
    };


    if (filters.especie) where.especie = filters.especie;
    if (filters.sexo) where.sexo = filters.sexo;
    if (filters.porte) where.porte = filters.porte;
    if (filters.nome) {
        where.nome = {
            contains: filters.nome,
            mode: 'insensitive',
        };
    }

    return this.prisma.animal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
}
  findAllComunitarios(filters: FindComunitariosDto) {
    const where: Prisma.AnimalWhereInput = {
      status: StatusAnimal.DISPONIVEL,
      comunitario: true,
    };

    if (filters.localizacaoComunitaria) {
      where.localizacaoComunitaria = {
        contains: filters.localizacaoComunitaria,
        mode: 'insensitive',
      };
    }

    return this.prisma.animal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    return animal;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findOne(id);

    if (updateAnimalDto.castrado !== undefined) {
      (updateAnimalDto as any).castrado =
        String(updateAnimalDto.castrado) === 'true';
    }
    if (updateAnimalDto.comunitario !== undefined) {
      (updateAnimalDto as any).comunitario =
        String(updateAnimalDto.comunitario) === 'true';
    }

    return this.prisma.animal.update({
      where: { id },
      data: updateAnimalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.animal.delete({ where: { id } });
  }
}