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

  // --- REGISTO ---
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

  // --- FUNÇÕES INTERNAS ---
  async findByEmail(email: string) {
    return this.prisma.usuario.findFirst({ where: { email } });
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return users.map(({ senha, ...rest }) => rest);
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    const { senha, ...result } = user;
    return result;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
    const { senha, ...result } = user;
    return result;
  }

  async updateRole(id: number, newRole: string) {
    await this.findOne(id);
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { role: newRole },
    });
    const { senha, ...result } = user;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }

  // --- PERFIL DO USUÁRIO ---
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
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const isPasswordMatching = await bcrypt.compare(changePasswordDto.senhaAtual, user.senha);
    if (!isPasswordMatching) throw new ForbiddenException('A senha atual está incorreta.');

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

  // --- RANKING DE PONTUAÇÃO ---
  async getRanking() {
    const ranking = await this.prisma.usuario.findMany({
      orderBy: { pontos: 'desc' },
      take: 10,
      select: {
        id: true,
        nome: true,
        pontos: true,
        profileImageUrl: true,
      },
    });
    return ranking;
  }
}