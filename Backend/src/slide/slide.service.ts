import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';

@Injectable()
export class SlideService {
  constructor(private prisma: PrismaService) {}

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

  async update(id: number, updateSlideDto: UpdateSlideDto) {
    await this.findOne(id);
    return this.prisma.slide.update({ where: { id }, data: updateSlideDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.slide.delete({ where: { id } });
  }
}
