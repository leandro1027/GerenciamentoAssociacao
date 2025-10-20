import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Especie, Sexo, Porte, StatusAnimal, Prisma } from '@prisma/client';
import { FindComunitariosDto } from './dto/find-comunitarios.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Injectable()
export class AnimalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService, // Injeta o serviço central de upload
  ) {}

  /**
   * Cria um novo registro de animal no banco de dados.
   * @param createAnimalDto Dados do formulário para criar o animal.
   * @param animalImageUrl Nome do arquivo da imagem salvo na Cloudflare R2.
   */
  create(createAnimalDto: CreateAnimalDto, animalImageUrl: string) {
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

  /**
   * Busca todos os animais disponíveis para adoção, com filtros opcionais.
   */
 async findAll(filters: {
  especie?: Especie;
  sexo?: Sexo;
  porte?: Porte;
  nome?: string;
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

  const animais = await this.prisma.animal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // ✅ Garante retorno de array sempre
  return Array.isArray(animais) ? animais : [];
}


  /**
   * Busca todos os animais comunitários disponíveis.
   */
  findAllComunitarios(filters: FindComunitariosDto) {
    const where: Prisma.AnimalWhereInput = { status: StatusAnimal.DISPONIVEL, comunitario: true };
    if (filters.localizacaoComunitaria) {
      where.localizacaoComunitaria = {
        contains: filters.localizacaoComunitaria,
        mode: 'insensitive',
      };
    }
    return this.prisma.animal.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Busca um único animal pelo seu ID.
   */
  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    return animal;
  }

  /**
   * Atualiza os dados de um animal. Se uma nova imagem for enviada,
   * a antiga é deletada da Cloudflare R2.
   * @param id ID do animal a ser atualizado.
   * @param updateAnimalDto Dados do formulário para atualizar.
   * @param animalImageUrl Nome do novo arquivo de imagem (opcional).
   */
  async update(id: string, updateAnimalDto: UpdateAnimalDto, animalImageUrl?: string) {
    const dataToUpdate = { ...updateAnimalDto };

    if (animalImageUrl) {
      // Busca o registro antigo para obter o nome do arquivo da imagem antiga.
      const animalAntigo = await this.findOne(id);
      
      // Verifica se a imagem antiga existe antes de tentar deletá-la.
      if (animalAntigo.animalImageUrl) {
        await this.uploadsService.deletarArquivo(animalAntigo.animalImageUrl);
      }
      
      // Adiciona o nome da nova imagem aos dados a serem atualizados.
      (dataToUpdate as any).animalImageUrl = animalImageUrl;
    }

    // Mantém a conversão de strings para booleans.
    if (dataToUpdate.castrado !== undefined) {
      (dataToUpdate as any).castrado = String(dataToUpdate.castrado) === 'true';
    }
    if (dataToUpdate.comunitario !== undefined) {
      (dataToUpdate as any).comunitario = String(dataToUpdate.comunitario) === 'true';
    }
    
    return this.prisma.animal.update({ where: { id }, data: dataToUpdate });
  }

  /**
   * Remove um animal do banco de dados e sua imagem associada da Cloudflare R2.
   * @param id ID do animal a ser removido.
   */
  async remove(id: string) {
    // Busca o animal para obter o nome do arquivo da imagem.
    const animal = await this.findOne(id);
    
    // Verifica se a imagem existe antes de tentar deletá-la.
    if (animal.animalImageUrl) {
      await this.uploadsService.deletarArquivo(animal.animalImageUrl);
    }

    // Deleta o registro do animal do banco de dados.
    return this.prisma.animal.delete({ where: { id } });
  }
}