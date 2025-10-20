import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService, // Injeta o serviço de upload
  ) {}

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

  // --- FUNÇÕES INTERNAS E DE ADMIN ---
  async findByEmail(email: string) {
    return this.prisma.usuario.findFirst({ where: { email } });
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
    });
    return users.map(({ senha, ...rest }) => rest); // Remove a senha de todos os usuários
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    // Retorna o usuário completo para uso interno, mas sem a senha para o controller
    const { senha, ...result } = user;
    return result;
  }
  
  // Retorna o usuário completo (incluindo senha) para validação interna
  private async findOneInternal(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);
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
    // Busca o usuário para obter o nome do arquivo do avatar
    const user = await this.findOneInternal(id);

    // Deleta o avatar da Cloudflare antes de deletar o usuário do DB
    if (user.profileImageUrl) {
      await this.uploadsService.deletarArquivo(user.profileImageUrl);
    }

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
    const user = await this.findOneInternal(id);

    const isPasswordMatching = await bcrypt.compare(changePasswordDto.senhaAtual, user.senha);
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

  async updateAvatar(id: number, avatarFileName: string) {
    // Busca o usuário para obter o nome do avatar antigo
    const usuarioAntigo = await this.findOneInternal(id);

    // Deleta o avatar antigo da Cloudflare antes de atualizar com o novo
    if (usuarioAntigo.profileImageUrl) {
      await this.uploadsService.deletarArquivo(usuarioAntigo.profileImageUrl);
    }

    // Atualiza o registro no banco com o nome do novo avatar
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { profileImageUrl: avatarFileName },
    });
    const { senha, ...result } = user;
    return result;
  }

  // --- RANKING DE PONTUAÇÃO ---
  async getRanking() {
    return this.prisma.usuario.findMany({
      orderBy: { pontos: 'desc' },
      take: 10,
      select: {
        id: true,
        nome: true,
        pontos: true,
        profileImageUrl: true,
      },
    });
  }
}