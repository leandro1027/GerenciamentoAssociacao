import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';

@Injectable()
export class ParceirosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createParceiroDto: CreateParceiroDto, file: Express.Multer.File) {
    const logoUrl = `/uploads/${file.filename}`;
    return this.prisma.parceiro.create({
      data: {
        nome: createParceiroDto.nome,
        logoUrl,
      },
    });
  }

  findAll() {
    return this.prisma.parceiro.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: number) {
    const parceiro = await this.prisma.parceiro.findUnique({ where: { id } });
    if (!parceiro) {
      throw new NotFoundException(`Parceiro com ID ${id} não encontrado.`);
    }
    return this.prisma.parceiro.delete({ where: { id } });
  }
}
