import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/utils/file-upload.utils';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Rota PÚBLICA para registo
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  // --- ROTAS DE GESTÃO DE PERFIL PARA UTILIZADOR LOGADO ---
  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usuarioService.updateProfile(userId, updateProfileDto);
  }

  @Patch('me/change-password')
  @UseGuards(JwtAuthGuard)
  changeMyPassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.usuarioService.changePassword(userId, changePasswordDto);
  }

   @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './uploads', filename: editFileName }),
      fileFilter: imageFileFilter,
    }),
  )
  uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;
    const imageUrl = `/uploads/${file.filename}`;
    return this.usuarioService.updateAvatar(userId, imageUrl);
  }

  // --- ROTAS RESTRITAS PARA ADMINISTRADORES ---

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch(':id/role')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
updateUserRole(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserRoleDto: UpdateUserRoleDto,
) {
  return this.usuarioService.updateRole(id, updateUserRoleDto.role);
}


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}
