// src/usuario/usuario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, salt);

    const user = await this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        senha: hashedPassword,
      },
    });

    const { senha, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {

    return this.prisma.usuario.findFirst({
      where: { email },
    });
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return users.map(user => {
      const { senha, ...result } = user;
      return result;
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilizador com ID ${id} não encontrado.`);
    }

    const { senha, ...result } = user;
    return result;
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