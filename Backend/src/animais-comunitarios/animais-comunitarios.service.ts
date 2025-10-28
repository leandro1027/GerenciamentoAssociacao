import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Injectable()
export class AnimaisComunitariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ✅ CRIAÇÃO
  async create(createDto: CreateAnimalComunitarioDto, imageUrl: string) {
    const latitude = parseFloat(createDto.latitude as any);
    const longitude = parseFloat(createDto.longitude as any);

    if (isNaN(latitude) || isNaN(longitude)) {
        throw new InternalServerErrorException('Latitude ou Longitude inválidas.');
    }

    return this.prisma.animalComunitario.create({
      data: {
        ...createDto,
        latitude,
        longitude,
        imageUrl: imageUrl,
      },
    });
  }

  // ✅ BUSCA PÚBLICA (usuários comuns)
  findAllPublic(searchTerm?: string) {
    const whereCondition = searchTerm
      ? {
          OR: [
            { nomeTemporario: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.animalComunitario.findMany({
      where: whereCondition,
      select: {
        id: true,
        nomeTemporario: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        // NÃO inclui dados sensíveis: enderecoCompleto, latitude, longitude
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ BUSCA ADMIN (dados completos)
  findAllAdmin(searchTerm?: string) {
    const whereCondition = searchTerm
      ? {
          OR: [
            { nomeTemporario: { contains: searchTerm, mode: 'insensitive' as const } },
            { enderecoCompleto: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.animalComunitario.findMany({
      where: whereCondition,
      // Inclui TODOS os campos
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ BUSCA PARA MAPA
  findAllForMap() {
    return this.prisma.animalComunitario.findMany({
      select: {
        id: true,
        nomeTemporario: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
      },
    });
  }

  // ✅ BUSCA INDIVIDUAL
  async findOne(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({
      where: { id },
    });
    
    if (!animal) {
      throw new NotFoundException(`Animal comunitário com ID ${id} não encontrado.`);
    }
    
    return animal;
  }

  // ✅ ATUALIZAÇÃO
  async update(
    id: string,
    updateDto: UpdateAnimalComunitarioDto,
    newImageUrl?: string,
  ) {
    const animalAtual = await this.findOne(id);

    const dataToUpdate: any = { ...updateDto };

    // Converte lat/lng se vierem no DTO
    if (updateDto.latitude) {
        const latitude = parseFloat(updateDto.latitude as any);
        if (isNaN(latitude)) throw new InternalServerErrorException('Latitude inválida.');
        dataToUpdate.latitude = latitude;
    }
    
    if (updateDto.longitude) {
        const longitude = parseFloat(updateDto.longitude as any);
        if (isNaN(longitude)) throw new InternalServerErrorException('Longitude inválida.');
        dataToUpdate.longitude = longitude;
    }

    // Processa nova imagem se fornecida
    if (newImageUrl) {
      if (animalAtual.imageUrl) {
        await this.uploadsService.deletarArquivo(animalAtual.imageUrl);
      }
      dataToUpdate.imageUrl = newImageUrl;
    }

    return this.prisma.animalComunitario.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // ✅ EXCLUSÃO
  async remove(id: string) {
    const animal = await this.findOne(id);

    if (animal.imageUrl) {
      await this.uploadsService.deletarArquivo(animal.imageUrl);
    }

    return this.prisma.animalComunitario.delete({
      where: { id },
    });
  }
}