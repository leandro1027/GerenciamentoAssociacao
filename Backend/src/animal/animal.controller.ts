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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Especie, Porte, Sexo } from 'generated/prisma';

@Controller('animais')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', { /* ... sua configuração de upload ... */ }))
  create(
    @Body() createAnimalDto: CreateAnimalDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }
    return this.animalService.create(createAnimalDto, file);
  }

  // MÉTODO ATUALIZADO PARA RECEBER OS FILTROS
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

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return this.animalService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animalService.remove(id);
  }
}
