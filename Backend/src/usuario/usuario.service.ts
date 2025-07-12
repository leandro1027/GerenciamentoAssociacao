// src/usuario/usuario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    return this.prisma.usuario.create({
      data: createUsuarioDto,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    // Primeiro, verifica se o usuário existe
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  async remove(id: number) {
    // Primeiro, verifica se o usuário existe
    await this.findOne(id);

    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}