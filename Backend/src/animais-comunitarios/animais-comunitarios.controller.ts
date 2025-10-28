import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Controller('animais-comunitarios')
export class AnimaisComunitariosController {
  constructor(
    private readonly animaisComunitariosService: AnimaisComunitariosService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ✅ ENDPOINT PÚBLICO - para usuários comuns (sem dados sensíveis)
  @Get()
  findAllPublic(@Query('search') searchTerm?: string) {
    return this.animaisComunitariosService.findAllPublic(searchTerm);
  }

  // ✅ ENDPOINT ADMIN - com dados completos (requer autenticação)
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllAdmin(@Query('search') searchTerm?: string) {
    return this.animaisComunitariosService.findAllAdmin(searchTerm);
  }

  // ✅ ENDPOINT PARA MAPA - apenas localizações básicas
  @Get('mapa/localizacoes')
  findAllForMap() {
    return this.animaisComunitariosService.findAllForMap();
  }

  // ✅ ENDPOINT INDIVIDUAL - público
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.findOne(id);
  }

  // ✅ CRIAÇÃO - apenas admin
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDto: CreateAnimalComunitarioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    const fotoFileName = await this.uploadsService.uploadArquivo(file);
    return this.animaisComunitariosService.create(createDto, fotoFileName);
  }

  // ✅ ATUALIZAÇÃO - apenas admin
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAnimalComunitarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fotoFileName: string | undefined = undefined;

    if (file) {
      fotoFileName = await this.uploadsService.uploadArquivo(file);
    }
    
    return this.animaisComunitariosService.update(id, updateDto, fotoFileName);
  }

  // ✅ EXCLUSÃO - apenas admin
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.remove(id);
  }
}