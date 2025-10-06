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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';

const generateUniqueFilename = (file: Express.Multer.File) => {
  const name = file.originalname.split('.')[0].replace(/\s/g, '-');
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${name}-${randomName}${fileExtName}`;
};

@Controller('animais-comunitarios')
export class AnimaisComunitariosController {
  constructor(private readonly animaisComunitariosService: AnimaisComunitariosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // ALTERADO AQUI
        filename: (req, file, callback) => {
          callback(null, generateUniqueFilename(file));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Apenas ficheiros de imagem são permitidos!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Body() createDto: CreateAnimalComunitarioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }
    return this.animaisComunitariosService.create(createDto, file);
  }

  @Get()
  findAll() {
    return this.animaisComunitariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // ALTERADO AQUI TAMBÉM
      filename: (req, file, callback) => {
        callback(null, generateUniqueFilename(file));
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return callback(
          new BadRequestException('Apenas ficheiros de imagem são permitidos!'),
          false,
        );
      }
      callback(null, true);
    },
  }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAnimalComunitarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.animaisComunitariosService.update(id, updateDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.remove(id);
  }
}