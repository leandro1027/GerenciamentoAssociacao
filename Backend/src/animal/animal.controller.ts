import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnimalService } from './animal.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Especie, Porte, Sexo } from '@prisma/client';
import { FindComunitariosDto } from './dto/find-comunitarios.dto';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Controller('animais')
export class AnimalController {
  constructor(
    private readonly animalService: AnimalService,
    private readonly uploadsService: UploadsService,
  ) {}

  // --- ANIMAIS REGULARES ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createAnimalDto: CreateAnimalDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    const animalImageUrl = await this.uploadsService.uploadArquivo(file);
    return this.animalService.create(createAnimalDto, animalImageUrl);
  }

  @Get()
  findAll(
    @Query('especie') especie?: Especie,
    @Query('sexo') sexo?: Sexo,
    @Query('porte') porte?: Porte,
    @Query('nome') nome?: string,
    @Query('context') context?: string,
  ) {
    if (context === 'admin') {
      return this.animalService.findAllAdmin({ especie, sexo, porte, nome });
    }
    return this.animalService.findAllDisponiveis({ especie, sexo, porte, nome });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let animalImageUrl: string | undefined = undefined;

    if (file) {
      animalImageUrl = await this.uploadsService.uploadArquivo(file);
    }
    
    return this.animalService.update(id, updateAnimalDto, animalImageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.remove(id);
  }

  // --- ANIMAIS COMUNITÁRIOS ---

  /**
   * ROTA PÚBLICA: Busca animais comunitários (apenas dados públicos)
   */
  @Get('comunitarios')
  findAllComunitariosPublic() {
    return this.animalService.findAllComunitariosPublic();
  }

  /**
   * ROTA ADMIN: Busca animais comunitários (todos os dados + filtros)
   */
  @Get('comunitarios/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllComunitariosAdmin(@Query() query: FindComunitariosDto) {
    return this.animalService.findAllComunitariosAdmin(query);
  }

  /**
   * ROTA ADMIN: Busca um animal comunitário específico
   */
  @Get('comunitarios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOneComunitario(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.findOneComunitario(id);
  }

  /**
   * ROTA ADMIN: Cria um novo animal comunitário
   */
  @Post('comunitarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async createComunitario(
    @Body() createAnimalComunitarioDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    const imageUrl = await this.uploadsService.uploadArquivo(file);
    return this.animalService.createComunitario(createAnimalComunitarioDto, imageUrl);
  }

  /**
   * ROTA ADMIN: Atualiza um animal comunitário
   */
  @Patch('comunitarios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async updateComunitario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimalComunitarioDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = await this.uploadsService.uploadArquivo(file);
    }
    
    return this.animalService.updateComunitario(id, updateAnimalComunitarioDto, imageUrl);
  }

  /**
   * ROTA ADMIN: Remove um animal comunitário
   */
  @Delete('comunitarios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeComunitario(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.removeComunitario(id);
  }
}