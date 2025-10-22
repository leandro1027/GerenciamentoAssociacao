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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create( // ADICIONADO: 'async'
    @Body() createAnimalDto: CreateAnimalDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    // MODIFICADO: Delega o upload para o serviço central
    const animalImageUrl = await this.uploadsService.uploadArquivo(file);

    // Passa apenas o nome do arquivo para o serviço de negócio
    return this.animalService.create(createAnimalDto, animalImageUrl);
  }

  // --- NENHUMA ALTERAÇÃO NECESSÁRIA NAS ROTAS 'GET' ---
  @Get()
  findAll(
    @Query('especie') especie?: Especie,
    @Query('sexo') sexo?: Sexo,
    @Query('porte') porte?: Porte,
    @Query('nome') nome?: string,
  ) {
    const filters = { especie, sexo, porte, nome };
    return this.animalService.findAll(filters);
  }

  @Get('comunitarios')
  findAllComunitarios(@Query() query: FindComunitariosDto) {
    return this.animalService.findAllComunitarios(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  // ADICIONADO: Funcionalidade de upload na atualização
  @UseInterceptors(FileInterceptor('file'))
  async update( // ADICIONADO: 'async'
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
    @UploadedFile() file?: Express.Multer.File, // ADICIONADO: Recebe arquivo opcional
  ) {
    let animalImageUrl: string | undefined = undefined;

    // ADICIONADO: Se um novo arquivo for enviado, faz o upload
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
}