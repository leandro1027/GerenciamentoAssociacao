import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';

@Injectable()
export class VoluntarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
  ) {}

  async create(createVoluntarioDto: CreateVoluntarioDto, usuarioId: number) {
    const { motivo } = createVoluntarioDto;

    const existingVoluntario = await this.prisma.voluntario.findUnique({
      where: { usuarioId: usuarioId },
    });

    if (existingVoluntario) {
      throw new ConflictException('Você já enviou uma candidatura.');
    }

    return this.prisma.voluntario.create({
      data: {
        usuarioId: usuarioId,
        motivo,
      },
    });
  }

  findAll() {
    return this.prisma.voluntario.findMany({
      include: {
        usuario: true,
      },
    });
  }

  async findOne(id: number) {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!voluntario) {
      throw new NotFoundException(`Candidatura de voluntário com ID ${id} não encontrada.`);
    }
    return voluntario;
  }

  findOneByUserId(userId: number) {
    return this.prisma.voluntario.findUnique({
      where: { usuarioId: userId },
    });
  }

  async update(id: number, updateVoluntarioDto: UpdateVoluntarioDto) {
    return this.prisma.$transaction(async (prisma) => {
      const voluntarioOriginal = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!voluntarioOriginal) {
        throw new NotFoundException(`Candidatura de voluntário com ID ${id} não encontrada.`);
      }

      const voluntarioAtualizado = await prisma.voluntario.update({
        where: { id },
        data: updateVoluntarioDto,
      });

      if (
        voluntarioAtualizado.status === 'aprovado' &&
        voluntarioOriginal.status !== 'aprovado' &&
        voluntarioAtualizado.usuarioId
      ) {
        await this.gamificacaoService.processarRecompensaPorVoluntariadoAprovado(
          voluntarioAtualizado.usuarioId,
          prisma,
        );
      }

      return voluntarioAtualizado;
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.voluntario.delete({
      where: { id },
    });
  }
}