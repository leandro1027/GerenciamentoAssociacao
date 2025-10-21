import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Especie, Sexo, Porte, StatusAnimal, Prisma } from '@prisma/client';
import { FindComunitariosDto } from './dto/find-comunitarios.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';
import { ConfigService } from '@nestjs/config'; // ADICIONE ESTA IMPORT

@Injectable()
export class AnimalService {
  private readonly r2PublicDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService, // ADICIONE ESTA INJEÇÃO
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
  create(createAnimalDto: CreateAnimalDto, animalImageUrl: string) {
    const { castrado, comunitario, ...restOfDto } = createAnimalDto;
    return this.prisma.animal.create({
      data: {
        ...restOfDto,
        castrado: String(castrado) === 'true',
        comunitario: String(comunitario) === 'true',
        animalImageUrl: animalImageUrl, // Salva apenas o nome do arquivo
      },
    });
  }

  /**
   * Busca todos os animais disponíveis para adoção, com filtros opcionais.
   * AGORA RETORNA URLS COMPLETAS
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

    // ✅ TRANSFORMA: Converte nomes de arquivo para URLs completas
    const animaisComUrls = animais.map(animal => ({
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    }));

    return Array.isArray(animaisComUrls) ? animaisComUrls : [];
  }

  /**
   * Busca todos os animais comunitários disponíveis.
   * AGORA RETORNA URLS COMPLETAS
   */
  async findAllComunitarios(filters: FindComunitariosDto) {
    const where: Prisma.AnimalWhereInput = { 
      status: StatusAnimal.DISPONIVEL, 
      comunitario: true 
    };
    
    if (filters.localizacaoComunitaria) {
      where.localizacaoComunitaria = {
        contains: filters.localizacaoComunitaria,
        mode: 'insensitive',
      };
    }
    
    const animais = await this.prisma.animal.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });

    // ✅ TRANSFORMA: Converte nomes de arquivo para URLs completas
    return animais.map(animal => ({
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    }));
  }

  /**
   * Busca um único animal pelo seu ID.
   * AGORA RETORNA URL COMPLETA
   */
  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`);
    }
    
    // ✅ TRANSFORMA: Converte nome do arquivo para URL completa
    return {
      ...animal,
      animalImageUrl: this.buildImageUrl(animal.animalImageUrl)
    };
  }

  /**
   * Atualiza os dados de um animal.
   */
  async update(id: string, updateAnimalDto: UpdateAnimalDto, animalImageUrl?: string) {
    const dataToUpdate = { ...updateAnimalDto };

    if (animalImageUrl) {
      const animalAntigo = await this.prisma.animal.findUnique({ where: { id } });
      
      if (animalAntigo?.animalImageUrl) {
        await this.uploadsService.deletarArquivo(animalAntigo.animalImageUrl);
      }
      
      (dataToUpdate as any).animalImageUrl = animalImageUrl;
    }

    if (dataToUpdate.castrado !== undefined) {
      (dataToUpdate as any).castrado = String(dataToUpdate.castrado) === 'true';
    }
    if (dataToUpdate.comunitario !== undefined) {
      (dataToUpdate as any).comunitario = String(dataToUpdate.comunitario) === 'true';
    }
    
    const animalAtualizado = await this.prisma.animal.update({ 
      where: { id }, 
      data: dataToUpdate 
    });

    // ✅ TRANSFORMA: Converte nome do arquivo para URL completa
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
      await this.uploadsService.deletarArquivo(animal.animalImageUrl);
    }

    return this.prisma.animal.delete({ where: { id } });
  }
}