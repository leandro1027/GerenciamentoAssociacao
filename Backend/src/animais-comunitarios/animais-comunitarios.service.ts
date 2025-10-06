import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste o caminho se o seu PrismaService estiver em outro lugar
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AnimaisComunitariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateAnimalComunitarioDto,
    file: Express.Multer.File,
  ) {
    const imageUrl = `/uploads/animais-comunitarios/${file.filename}`;

    return this.prisma.animalComunitario.create({
      data: {
        ...dto,
        imageUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.animaComunitario.findMany({
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
      throw new NotFoundException(`Registo com o ID '${id}' não encontrado.`);
    }
    return animal;
  }

  async update(
    id: string,
    dto: UpdateAnimalComunitarioDto,
    file?: Express.Multer.File,
  ) {
    const animalAtual = await this.findOne(id);
    const data: any = { ...dto };

    if (file) {
      data.imageUrl = `/uploads/animais-comunitarios/${file.filename}`;

      if (animalAtual.imageUrl) {
        const oldImagePath = join(process.cwd(), animalAtual.imageUrl);
        try {
          await unlink(oldImagePath);
        } catch (error) {
          console.error(`Falha ao apagar a imagem antiga: ${oldImagePath}`, error);
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

    await this.prisma.animalComunitario.delete({
      where: { id },
    });

    if (animal.imageUrl) {
      const imagePath = join(process.cwd(), animal.imageUrl);
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error(`Falha ao apagar a imagem: ${imagePath}`, error);
      }
    }
    
    return;
  }
}