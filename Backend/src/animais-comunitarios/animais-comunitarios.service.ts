import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { UploadsService } from 'src/uploads-s3/upload.service'; // <--- 1. Importar UploadsService

@Injectable()
export class AnimaisComunitariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService, // <--- 2. Injetar UploadsService
  ) {}

  // Renomeado parâmetro para clareza (o DTO vem do Body, o nome do arquivo vem do upload)
  async create(createDto: CreateAnimalComunitarioDto, imageUrl: string) {
    // A latitude e longitude vêm como string do FormData, converter para float
    const latitude = parseFloat(createDto.latitude as any);
    const longitude = parseFloat(createDto.longitude as any);

    if (isNaN(latitude) || isNaN(longitude)) {
        throw new InternalServerErrorException('Latitude ou Longitude inválidas.');
    }

    return this.prisma.animalComunitario.create({
      data: {
        ...createDto,
        latitude, // Salva como float
        longitude, // Salva como float
        imageUrl: imageUrl, // Salva o nome do arquivo retornado pelo UploadsService
      },
    });
  }

  // findAll, findAllForMap - Assumindo que estão corretos
  findAll(searchTerm?: string) {
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
       orderBy: { createdAt: 'desc' }, // Ou outra ordenação desejada
    });
  }

  findAllForMap() {
    return this.prisma.animalComunitario.findMany({
       select: {
          id: true,
          nomeTemporario: true,
          latitude: true,
          longitude: true,
          imageUrl: true, // Incluir a URL da imagem se quiser mostrar no popup do mapa
       },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({
      where: { id },
    });
    if (!animal) {
      throw new NotFoundException(`Animal comunitário com ID ${id} não encontrado.`);
    }
    return animal;
  }


  // Renomeado parâmetro para clareza
  async update(
    id: string,
    updateDto: UpdateAnimalComunitarioDto,
    newImageUrl?: string, // Nome do novo arquivo, se houver
  ) {
    // 1. Busca o registro ATUAL para ter a URL da imagem antiga
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


    // 2. Verifica se uma NOVA imagem foi enviada
    if (newImageUrl) {
      // 3. Se sim, TENTA deletar a imagem ANTIGA do R2
      if (animalAtual.imageUrl) {
         // Não bloqueia se a exclusão falhar, apenas loga (comportamento do UploadsService)
        await this.uploadsService.deletarArquivo(animalAtual.imageUrl);
      }
      // 4. Adiciona a NOVA URL da imagem aos dados a serem atualizados
      dataToUpdate.imageUrl = newImageUrl;
    }

    // 5. Atualiza o registro no banco de dados
    return this.prisma.animalComunitario.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    // 1. Busca o registro para obter a URL da imagem
    const animal = await this.findOne(id);

    // 2. TENTA deletar a imagem associada do R2
    if (animal.imageUrl) {
        // Não bloqueia se a exclusão falhar, apenas loga
      await this.uploadsService.deletarArquivo(animal.imageUrl);
    }

    // 3. Deleta o registro do banco de dados
    return this.prisma.animalComunitario.delete({
      where: { id },
    });
  }
}