import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SlideService } from './slide.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadsService } from 'src/uploads-s3/upload.service';

@Controller('slide')
export class SlideController {
  constructor(
    private readonly slideService: SlideService,
    private readonly uploadsService: UploadsService, // ADICIONADO
  ) {}

  @Get()
  findAll() {
    return this.slideService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file')) // MODIFICADO
  async create( // MODIFICADO
    @UploadedFile() file: Express.Multer.File,
    @Body() createSlideDto: CreateSlideDto,
  ) {
    if (!file) {
      throw new BadRequestException('Ficheiro de imagem é obrigatório.');
    }
    // MODIFICADO: Delega o upload para o serviço central
    const imageUrl = await this.uploadsService.uploadArquivo(file);
    return this.slideService.create(createSlideDto, imageUrl);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file')) // MODIFICADO
  async update( // MODIFICADO
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSlideDto: UpdateSlideDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;
    if (file) {
      imageUrl = await this.uploadsService.uploadArquivo(file);
    }
    return this.slideService.update(id, updateSlideDto, imageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slideService.remove(id);
  }
}