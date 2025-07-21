import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SlideService } from './slide.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { editFileName, imageFileFilter } from '../utils/file-upload.utils';

@Controller('slide')
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  // Rota PÚBLICA: Qualquer pessoa pode ver os slides.
  @Get()
  findAll() {
    return this.slideService.findAll();
  }

  // Rota de ADMIN: Apenas administradores podem criar slides.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './uploads', filename: editFileName }),
      fileFilter: imageFileFilter,
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() createSlideDto: CreateSlideDto) {
    if (!file) throw new Error('Ficheiro de imagem é obrigatório.');
    const imageUrl = `/uploads/${file.filename}`;
    return this.slideService.create(createSlideDto, imageUrl);
  }
  
  // Rota de ADMIN: Apenas administradores podem apagar slides.
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slideService.remove(id);
  }
}
