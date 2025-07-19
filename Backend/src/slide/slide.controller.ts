import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SlideService } from './slide.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { editFileName, imageFileFilter } from '../utils/file-upload.utils';

@Controller('slide')
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Get()
  findAll() {
    return this.slideService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() createSlideDto: CreateSlideDto) {
    const imageUrl = `/uploads/${file.filename}`;
    return this.slideService.create(createSlideDto, imageUrl);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSlideDto: UpdateSlideDto) {
    return this.slideService.update(id, updateSlideDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slideService.remove(id);
  }
}
