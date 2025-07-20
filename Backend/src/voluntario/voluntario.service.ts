import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class VoluntarioService {
  constructor(private readonly prisma:PrismaService) {}

  create(createVoluntarioDto: CreateVoluntarioDto) {
    return this.prisma.voluntario.create({
      data: createVoluntarioDto,
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
