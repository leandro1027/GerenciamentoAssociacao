import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnimaisComunitariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo registro de animal comunitário.
   */
  create(createDto: CreateAnimalComunitarioDto, file: Express.Multer.File) {
    const imageUrl = `/uploads/${file.filename}`;

    const { nomeTemporario, enderecoCompleto, latitude, longitude } = createDto;

    return this.prisma.animalComunitario.create({
      data: {
        nomeTemporario,
        enderecoCompleto,
        latitude,
        longitude,
        imageUrl: imageUrl,
      },
    });
  }

  /**
   * Busca todos os animais, aplicando um filtro de busca se fornecido.
   */
  findAll(searchTerm?: string) {
    const whereClause: Prisma.AnimalComunitarioWhereInput = {};

    // Se um termo de busca foi enviado pelo frontend, constrói a cláusula de filtro
    if (searchTerm) {
      whereClause.OR = [
        {
          nomeTemporario: {
            contains: searchTerm,
            mode: 'insensitive', // Busca case-insensitive no nome
          },
        },
        {
          enderecoCompleto: {
            contains: searchTerm,
            mode: 'insensitive', // Busca case-insensitive no endereço
          },
        },
      ];
    }

    // Executa a busca com a cláusula de filtro (que pode estar vazia ou preenchida)
    return this.prisma.animalComunitario.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retorna apenas os dados necessários para o mapa.
   */
  findAllForMap() {
    return this.prisma.animalComunitario.findMany({
      select: {
        id: true,
        nomeTemporario: true,
        imageUrl: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({
      where: { id },
    });
    if (!animal) {
      throw new NotFoundException(
        `Registo de animal comunitário com ID "${id}" não encontrado.`,
      );
    }
    return animal;
  }

  async update(
    id: string,
    updateDto: UpdateAnimalComunitarioDto,
    file?: Express.Multer.File,
  ) {
    const animalAtual = await this.findOne(id);
    const data: Prisma.AnimalComunitarioUpdateInput = { ...updateDto };

    if (file) {
      data.imageUrl = `/uploads/${file.filename}`;
      if (animalAtual.imageUrl) {
        const oldImagePath = join(process.cwd(), 'uploads', animalAtual.imageUrl.replace('/uploads/', ''));
        try {
          await unlink(oldImagePath);
        } catch (error) {
          console.error(
            `Falha ao apagar imagem antiga: ${oldImagePath}`,
            error,
          );
        }
      }
    }

    return this.prisma.animalComunitario.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const animal = await this.findOne(id);
    const deletedRecord = await this.prisma.animalComunitario.delete({
      where: { id },
    });

    if (animal.imageUrl) {
      const imagePath = join(process.cwd(), 'uploads', animal.imageUrl.replace('/uploads/', ''));
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error(`Falha ao apagar imagem: ${imagePath}`, error);
      }
    }

    return deletedRecord;
  }
}