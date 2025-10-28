import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Especie, Sexo, Porte, StatusAnimal, Prisma } from '@prisma/client';
import { FindComunitariosDto } from './dto/find-comunitarios.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnimalService {
  private readonly r2PublicDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {
    this.r2PublicDomain = this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';
  }

  /**
   * Converte nome do arquivo para URL completa do R2
   */
  private buildImageUrl(fileName: string | null): string | null {
    if (!fileName) return null;
    if (fileName.startsWith('http')) return fileName;
    return this.r2PublicDomain ? `${this.r2PublicDomain}/${fileName}` : fileName;
  }

  /**
   * Cria um novo registro de animal no banco de dados.
   */
  async create(createAnimalDto: CreateAnimalDto, animalImageUrl: string) {
    const { castrado, comunitario, ...restOfDto } = createAnimalDto;
    
    const data = {
      ...restOfDto,
      castrado: String(castrado) === 'true' || castrado === true,
      comunitario: String(comunitario) === 'true' || comunitario === true,
      animalImageUrl: animalImageUrl,
      isFromDivulgacao: false,
    };
    
    const animal = await this.prisma.animal.create({ data });

    return {
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    };
  }

  /**
   * Busca todos os animais (para painel admin), com filtros opcionais.
   */
  async findAllAdmin(filters: {
    especie?: Especie;
    sexo?: Sexo;
    porte?: Porte;
    nome?: string;
  }) {
    const where: Prisma.AnimalWhereInput = {
      comunitario: false,
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

    const animaisComUrls = animais.map(animal => ({
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    }));

    return Array.isArray(animaisComUrls) ? animaisComUrls : [];
  }

  /**
   * Busca todos os animais DISPONÍVEIS (público), com filtros opcionais.
   */
  async findAllDisponiveis(filters: {
    especie?: Especie;
    sexo?: Sexo;
    porte?: Porte;
    nome?: string;
  }) {
    const where: Prisma.AnimalWhereInput = {
      status: StatusAnimal.DISPONIVEL,
      comunitario: false,
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

    const animaisComUrls = animais.map(animal => ({
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    }));

    return Array.isArray(animaisComUrls) ? animaisComUrls : [];
  }

  // --- ANIMAIS COMUNITÁRIOS (FUNÇÕES CORRIGIDAS) ---

  /**
   * [PÚBLICO] Busca todos os animais comunitários.
   * Retorna APENAS dados não-sensíveis.
   */
  async findAllComunitariosPublic() {
    const animais = await this.prisma.animalComunitario.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nomeTemporario: true,
        imageUrl: true,
        // NÃO retorna: latitude, longitude, enderecoCompleto, descricao, etc.
      }
    });

    return animais.map(animal => ({
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    }));
  }

  /**
   * [ADMIN] Busca todos os animais comunitários.
   * Retorna TODOS os dados e permite filtros.
   * CORREÇÃO: Usando o modelo correto AnimalComunitario
   */
  async findAllComunitariosAdmin(filters: FindComunitariosDto) {
    const where: Prisma.AnimalComunitarioWhereInput = {};
    
    if (filters.search) {
      where.OR = [
        { nomeTemporario: { contains: filters.search, mode: 'insensitive' } },
        { enderecoCompleto: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    // CORREÇÃO: Buscando de animalComunitario, não de animal
    const animais = await this.prisma.animalComunitario.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });

    return animais.map(animal => ({
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    }));
  }

  /**
   * Busca um único animal comunitário pelo ID (para admin)
   */
  async findOneComunitario(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({ 
      where: { id } 
    });
    
    if (!animal) {
      throw new NotFoundException(`Animal comunitário com ID "${id}" não encontrado.`);
    }
    
    return {
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    };
  }

  /**
   * Cria um novo animal comunitário
   */
  async createComunitario(createAnimalComunitarioDto: any, imageUrl: string) {
    const data = {
      ...createAnimalComunitarioDto,
      imageUrl: imageUrl,
    };
    
    const animal = await this.prisma.animalComunitario.create({ data });

    return {
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    };
  }

  /**
   * Atualiza um animal comunitário
   */
  async updateComunitario(id: string, updateAnimalComunitarioDto: any, imageUrl?: string) {
    const animalAntigo = await this.prisma.animalComunitario.findUnique({ 
      where: { id } 
    });
    
    if (!animalAntigo) {
      throw new NotFoundException(`Animal comunitário com ID "${id}" não encontrado.`);
    }

    const dataToUpdate: Prisma.AnimalComunitarioUpdateInput = { ...updateAnimalComunitarioDto };

    if (imageUrl) {
      // Deleta a imagem antiga
      if (animalAntigo.imageUrl) {
        try {
          await this.uploadsService.deletarArquivo(animalAntigo.imageUrl);
        } catch(e) { 
          console.error(`Erro ao deletar imagem antiga ${animalAntigo.imageUrl}:`, e)
        }
      }
      dataToUpdate.imageUrl = imageUrl;
    }

    const animalAtualizado = await this.prisma.animalComunitario.update({ 
      where: { id }, 
      data: dataToUpdate 
    });

    return {
      ...animalAtualizado,
      imageUrl: this.buildImageUrl(animalAtualizado.imageUrl)
    };
  }

  /**
   * Remove um animal comunitário
   */
  async removeComunitario(id: string) {
    const animal = await this.prisma.animalComunitario.findUnique({ 
      where: { id } 
    });
    
    if (!animal) {
      throw new NotFoundException(`Animal comunitário com ID "${id}" não encontrado.`);
    }
    
    if (animal.imageUrl) {
      try {
        await this.uploadsService.deletarArquivo(animal.imageUrl);
      } catch(e) { 
        console.error(`Erro ao deletar imagem ${animal.imageUrl}:`, e)
      }
    }

    return this.prisma.animalComunitario.delete({ where: { id } });
  }

  // --- FIM ANIMAIS COMUNITÁRIOS ---

  /**
   * Busca um único animal pelo seu ID.
   */
  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    
    return {
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    };
  }

  /**
   * Atualiza os dados de um animal.
   */
  async update(id: string, updateAnimalDto: UpdateAnimalDto, animalImageUrl?: string) {
    const animalAntigo = await this.prisma.animal.findUnique({ where: { id } });
    if (!animalAntigo) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }

    const dataToUpdate: Prisma.AnimalUpdateInput = { ...updateAnimalDto };

    if (animalImageUrl) {
      if (animalAntigo.animalImageUrl) {
        try {
          await this.uploadsService.deletarArquivo(animalAntigo.animalImageUrl);
        } catch(e) { 
          console.error(`Erro ao deletar imagem antiga ${animalAntigo.animalImageUrl}:`, e)
        }
      }
      dataToUpdate.animalImageUrl = animalImageUrl;
    }

    if (updateAnimalDto.castrado !== undefined) {
      (dataToUpdate as any).castrado = String(updateAnimalDto.castrado) === 'true' || updateAnimalDto.castrado === true;
    }
    if (updateAnimalDto.comunitario !== undefined) {
      (dataToUpdate as any).comunitario = String(updateAnimalDto.comunitario) === 'true' || updateAnimalDto.comunitario === true;
    }
    
    const animalAtualizado = await this.prisma.animal.update({ 
      where: { id }, 
      data: dataToUpdate 
    });

    return {
      ...animalAtualizado,
      animalImageUrl: this.buildImageUrl(animalAtualizado.animalImageUrl)
    };
  }

  /**
   * Remove um animal do banco de dados e sua imagem associada.
   */
  async remove(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    
    if (animal.animalImageUrl) {
      try {
        await this.uploadsService.deletarArquivo(animal.animalImageUrl);
      } catch(e) { 
        console.error(`Erro ao deletar imagem ${animal.animalImageUrl}:`, e)
      }
    }

    return this.prisma.animal.delete({ where: { id } });
  }
}