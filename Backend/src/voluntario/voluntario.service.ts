import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class VoluntarioService {
  constructor(private readonly prisma:PrismaService) {}

   async create(createVoluntarioDto: CreateVoluntarioDto) {
    const { usuarioId, motivo } = createVoluntarioDto;

    // 2. Verifique se já existe uma candidatura para este utilizador
    const existingVoluntario = await this.prisma.voluntario.findUnique({
      where: {
        usuarioId: usuarioId,
      },
    });

    // 3. Se já existir, retorne um erro claro
    if (existingVoluntario) {
      throw new ConflictException('Este utilizador já enviou uma candidatura.');
    }

    // 4. Se não existir, crie a nova candidatura
    return this.prisma.voluntario.create({
      data: {
        usuarioId,
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
    await this.findOne(id);

    return this.prisma.voluntario.update({
      where: {id},
      data: updateVoluntarioDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.voluntario.delete({
      where: {id},
    });
  }
}
