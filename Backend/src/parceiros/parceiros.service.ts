import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Injectable()
export class ParceirosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  create(createParceiroDto: CreateParceiroDto, logoFileName: string) {
    return this.prisma.parceiro.create({
      data: {
        nome: createParceiroDto.nome,
        logoUrl: logoFileName,
      },
    });
  }

  findAll() {
    return this.prisma.parceiro.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: number) {
    const parceiro = await this.prisma.parceiro.findUniqueOrThrow({ where: { id } });

    await this.uploadsService.deletarArquivo(parceiro.logoUrl);

    return this.prisma.parceiro.delete({ where: { id } });
  }
}