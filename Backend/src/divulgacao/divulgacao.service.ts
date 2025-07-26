import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';

@Injectable()
export class DivulgacaoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDivulgacaoDto: CreateDivulgacaoDto, file: Express.Multer.File, userId: number) {
    const imageUrl = `/uploads/${file.filename}`;
    
    const { localizacao, raca, descricao } = createDivulgacaoDto;

    return this.prisma.divulgacao.create({
      data: {
        localizacao,
        raca,
        descricao,
        castrado: createDivulgacaoDto.castrado === true || (createDivulgacaoDto.castrado as any) === 'true',
        resgate: createDivulgacaoDto.resgate === true || (createDivulgacaoDto.resgate as any) === 'true',
        imageUrl: imageUrl,
        // CORREÇÃO: Usar 'connect' para associar ao utilizador
        usuario: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  // Para o painel admin
  findAll() {
    return this.prisma.divulgacao.findMany({
      include: { usuario: true }, // Agora isto vai funcionar
      orderBy: { createdAt: 'desc' },
    });
  }
}
