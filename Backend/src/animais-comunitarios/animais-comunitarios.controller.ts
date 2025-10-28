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

  // ✅ CRIAÇÃO - apenas admin (MÉTODO CORRIGIDO)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    // 👇 CORREÇÃO: Trocamos 'createDto: CreateAnimalComunitarioDto' por 'body: any'
    // Isso evita que o ValidationPipe falhe com dados de FormData.
    @Body() body: any, 
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    // Montamos o DTO manualmente a partir do 'body'
    // O Service vai converter latitude/longitude de string para float.
    const createDto: CreateAnimalComunitarioDto = {
      nomeTemporario: body.nomeTemporario,
      enderecoCompleto: body.enderecoCompleto,
      latitude: body.latitude,
      longitude: body.longitude,
    };

    const fotoFileName = await this.uploadsService.uploadArquivo(file);
    
    // Passamos o DTO montado manualmente e o nome do arquivo
    return this.animaisComunitariosService.create(createDto, fotoFileName);
  }

  // ✅ ATUALIZAÇÃO - apenas admin
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    // 👇 CORREÇÃO: Aplicamos a mesma lógica do create
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fotoFileName: string | undefined = undefined;

    // Montamos o DTO de atualização manualmente
    const updateDto: UpdateAnimalComunitarioDto = {
      nomeTemporario: body.nomeTemporario,
      enderecoCompleto: body.enderecoCompleto,
      latitude: body.latitude,
      longitude: body.longitude,
    };

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
