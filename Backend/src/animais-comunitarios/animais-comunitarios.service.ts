import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AnimaisComunitariosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDto: CreateAnimalComunitarioDto, file: Express.Multer.File) {
    const imageUrl = `/uploads/${file.filename}`; // ALTERADO AQUI

    return this.prisma.animalComunitario.create({
      data: {
        ...createDto,
        imageUrl: imageUrl,
      },
    });
  }

  findAll() {
    return this.prisma.animalComunitario.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Registo de animal comunitário com ID "${id}" não encontrado.`);
    }
    return animal;
  }

  async update(id: string, updateDto: UpdateAnimalComunitarioDto, file?: Express.Multer.File) {
    const animalAtual = await this.findOne(id);
    
    const data: any = { ...updateDto };

    if (file) {
      data.imageUrl = `/uploads/${file.filename}`; // ALTERADO AQUI TAMBÉM

      if (animalAtual.imageUrl) {
        const oldImagePath = join(process.cwd(), animalAtual.imageUrl);
        try {
          await unlink(oldImagePath);
        } catch (error) {
          console.error(`Falha ao apagar imagem antiga: ${oldImagePath}`, error);
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

    const deletedRecord = await this.prisma.animalComunitario.delete({ where: { id } });

    if (animal.imageUrl) {
      const imagePath = join(process.cwd(), animal.imageUrl);
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error(`Falha ao apagar imagem: ${imagePath}`, error);
      }
    }
    
    return deletedRecord;
  }
}