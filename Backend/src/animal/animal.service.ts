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

  // MODIFICADO: A assinatura do método agora espera uma string 'animalImageUrl'
  create(createAnimalDto: CreateAnimalDto, animalImageUrl: string) {
    // REMOVIDO: A construção da URL local
    const { castrado, comunitario, ...restOfDto } = createAnimalDto;

    return this.prisma.animal.create({
      data: {
        ...restOfDto,
        castrado: String(castrado) === 'true',
        comunitario: String(comunitario) === 'true',
        animalImageUrl: animalImageUrl, // MODIFICADO: Salva o nome do arquivo vindo da Cloudflare
      },
    });
  }

  // --- NENHUMA ALTERAÇÃO EM 'findAll', 'findAllComunitarios' e 'findOne' ---
  findAll(filters: { /* ... */ }) { /* ...código existente... */ }
  findAllComunitarios(filters: FindComunitariosDto) { /* ...código existente... */ }
  async findOne(id: string) { /* ...código existente... */ }

  // MODIFICADO: A assinatura também muda aqui para receber uma string opcional
  async update(
    id: string,
    updateAnimalDto: UpdateAnimalDto,
    animalImageUrl?: string, // ADICIONADO
  ) {
    await this.findOne(id);

    const dataToUpdate = { ...updateAnimalDto };

    if (dataToUpdate.castrado !== undefined) {
      (dataToUpdate as any).castrado = String(dataToUpdate.castrado) === 'true';
    }
    if (dataToUpdate.comunitario !== undefined) {
      (dataToUpdate as any).comunitario = String(dataToUpdate.comunitario) === 'true';
    }

    // ADICIONADO: Se um novo nome de arquivo foi passado, ele é adicionado para atualização
    if (animalImageUrl) {
      (dataToUpdate as any).animalImageUrl = animalImageUrl;
      // TODO: Implementar a lógica para deletar a foto antiga da Cloudflare R2
    }

    return this.prisma.animal.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // TODO: Antes de deletar, buscar o nome da foto no DB para deletá-la da Cloudflare R2
    return this.prisma.animal.delete({ where: { id } });
  }
}