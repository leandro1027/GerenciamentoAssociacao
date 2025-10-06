import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';

@Controller('animais-comunitarios')
export class AnimaisComunitariosController {
  constructor(
    private readonly animaisComunitariosService: AnimaisComunitariosService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/animais-comunitarios',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createAnimalComunitarioDto: CreateAnimalComunitarioDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({ fileType: 'image/' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.animaisComunitariosService.create(createAnimalComunitarioDto, file);
  }

  @Get()
  findAll() {
    return this.animaisComunitariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animaisComunitariosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/animais-comunitarios',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id') id: string,
    @Body() updateAnimalComunitarioDto: UpdateAnimalComunitarioDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({ fileType: 'image/' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.animaisComunitariosService.update(id, updateAnimalComunitarioDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.animaisComunitariosService.remove(id);
  }
}