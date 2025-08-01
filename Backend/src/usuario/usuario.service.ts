import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  // Rota pública para registo
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

  // Usado internamente pela autenticação
  async findByEmail(email: string) {
    return this.prisma.usuario.findFirst({ where: { email } });
  }

  // Rota de Admin
  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return users.map(user => {
      const { senha, ...result } = user;
      return result;
    });
  }

  // Rota de Admin e uso interno
  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilizador com ID ${id} não encontrado.`);
    }
    const { senha, ...result } = user;
    return result;
  }

  // Rota de Admin
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
    const { senha, ...result } = user;
    return result;
  }

  // Rota de Admin
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }

  // --- MÉTODOS PARA O PERFIL DO UTILIZADOR ---

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: updateProfileDto,
    });
    const { senha, ...result } = user;
    return result;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.');
    }
    
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.senhaAtual,
      user.senha,
    );

    if (!isPasswordMatching) {
      throw new ForbiddenException('A senha atual está incorreta.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(changePasswordDto.novaSenha, salt);

    await this.prisma.usuario.update({
      where: { id },
      data: { senha: hashedPassword },
    });
  }

  async updateAvatar(id: number, imageUrl: string) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { profileImageUrl: imageUrl },
    });
    const { senha, ...result } = user;
    return result;
}
}
