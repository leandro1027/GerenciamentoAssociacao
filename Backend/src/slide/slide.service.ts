import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Injectable()
export class SlideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService, // ADICIONADO
  ) {}

  findAll() {
    return this.prisma.slide.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(createSlideDto: CreateSlideDto, imageUrl: string) {
    return this.prisma.slide.create({
      data: {
        ...createSlideDto,
        imageUrl,
      },
    });
  }

  async findOne(id: number) {
    const slide = await this.prisma.slide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException(`Slide com ID ${id} não encontrado.`);
    return slide;
  }

  async update(id: number, updateSlideDto: UpdateSlideDto, imageUrl?: string) {
    const data: any = { ...updateSlideDto };
    
    // MODIFICADO: Se um novo arquivo foi enviado, deleta o antigo e atualiza o novo
    if (imageUrl) {
      const slideAntigo = await this.findOne(id);
      await this.uploadsService.deletarArquivo(slideAntigo.imageUrl);
      data.imageUrl = imageUrl;
    }

    return this.prisma.slide.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // MODIFICADO: Deleta o arquivo da Cloudflare antes de deletar do DB
    const slide = await this.findOne(id);
    await this.uploadsService.deletarArquivo(slide.imageUrl);
    return this.prisma.slide.delete({ where: { id } });
  }
}