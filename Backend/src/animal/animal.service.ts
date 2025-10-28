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
    private readonly configService: ConfigService, // ADICIONADO
  ) {
    // Obtém o domínio público do R2 do environment
    this.r2PublicDomain = this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';
  }

  /**
   * Converte nome do arquivo para URL completa do R2
   */
  private buildImageUrl(fileName: string | null): string | null {
    if (!fileName) return null;
    if (fileName.startsWith('http')) return fileName; // Já é URL completa
    return this.r2PublicDomain ? `${this.r2PublicDomain}/${fileName}` : fileName;
  }

  /**
   * Cria um novo registro de animal no banco de dados.
   */
  async create(createAnimalDto: CreateAnimalDto, animalImageUrl: string) {
    const { castrado, comunitario, ...restOfDto } = createAnimalDto;
    
    // Converte os campos 'castrado' e 'comunitario' para boolean
    const data = {
      ...restOfDto,
      castrado: String(castrado) === 'true' || castrado === true,
      comunitario: String(comunitario) === 'true' || comunitario === true,
      animalImageUrl: animalImageUrl, // Salva apenas o nome do arquivo
      isFromDivulgacao: false, // Garante que animais criados manualmente não são de divulgação
    };
    
    const animal = await this.prisma.animal.create({ data });

    // Retorna o animal criado com a URL completa
    return {
        ...animal,
        animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    };
  }

  /**
   * Busca todos os animais (para painel admin), com filtros opcionais.
   * Retorna URLs completas.
   */
  async findAllAdmin(filters: {
    especie?: Especie;
    sexo?: Sexo;
    porte?: Porte;
    nome?: string;
  }) {
    const where: Prisma.AnimalWhereInput = {
       comunitario: false, // Exclui animais comunitários desta lista
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
   * Retorna URLs completas.
   */
  async findAllDisponiveis(filters: {
    especie?: Especie;
    sexo?: Sexo;
    porte?: Porte;
    nome?: string;
  }) {
    const where: Prisma.AnimalWhereInput = {
      status: StatusAnimal.DISPONIVEL,
      comunitario: false, // Exclui animais comunitários desta lista
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


  // --- ANIMAIS COMUNITÁRIOS (NOVAS FUNÇÕES) ---

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
        // NÃO retorna latitude, longitude, ou enderecoCompleto
      }
    });

    // Converte nomes de arquivo para URLs completas
    return animais.map(animal => ({
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    }));
  }

  /**
   * [ADMIN] Busca todos os animais comunitários.
   * Retorna TODOS os dados e permite filtros.
   */
  async findAllComunitariosAdmin(filters: FindComunitariosDto) {
    const where: Prisma.AnimalComunitarioWhereInput = {};
    
    // Renomeado DTO para 'search'
    if (filters.search) {
      where.OR = [
        { nomeTemporario: { contains: filters.search, mode: 'insensitive' } },
        { enderecoCompleto: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    const animais = await this.prisma.animalComunitario.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });

    // Converte nomes de arquivo para URLs completas
    return animais.map(animal => ({
      ...animal,
      imageUrl: this.buildImageUrl(animal.imageUrl)
    }));
  }

  // --- FIM ANIMAIS COMUNITÁRIOS ---


  /**
   * Busca um único animal pelo seu ID.
   * Retorna URL completa.
   */
  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    
    // Transforma: Converte nome do arquivo para URL completa
    return {
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    };
  }

  /**
   * Atualiza os dados de um animal.
   */
  async update(id: string, updateAnimalDto: UpdateAnimalDto, animalImageUrl?: string) {
    // Garante que o animal existe
    const animalAntigo = await this.prisma.animal.findUnique({ where: { id } });
     if (!animalAntigo) {
       throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
     }

    const dataToUpdate: Prisma.AnimalUpdateInput = { ...updateAnimalDto };

    if (animalImageUrl) {
      // Deleta a imagem antiga ANTES de atualizar
      if (animalAntigo.animalImageUrl) {
         try {
           await this.uploadsService.deletarArquivo(animalAntigo.animalImageUrl);
         } catch(e) { console.error(`Erro ao deletar imagem antiga ${animalAntigo.animalImageUrl}:`, e)}
      }
      dataToUpdate.animalImageUrl = animalImageUrl;
    }

    // Converte campos booleanos vindos do FormData
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

    // Transforma: Converte nome do arquivo para URL completa
    return {
      ...animalAtualizado,
      animalImageUrl: this.buildImageUrl(animalAtualizado.animalImageUrl)
    };
  }

  /**
   * Remove um animal do banco de dados e sua imagem associada da Cloudflare R2.
   */
  async remove(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    
    if (animal.animalImageUrl) {
       try {
         await this.uploadsService.deletarArquivo(animal.animalImageUrl);
       } catch(e) { console.error(`Erro ao deletar imagem ${animal.animalImageUrl}:`, e)}
    }

    return this.prisma.animal.delete({ where: { id } });
  }
}
