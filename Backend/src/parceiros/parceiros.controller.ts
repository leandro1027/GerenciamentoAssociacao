import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/uploads-s3/upload.service';


@Controller('parceiros')
export class ParceirosController {
  constructor(
    private readonly parceirosService: ParceirosService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createParceiroDto: CreateParceiroDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro do logótipo é obrigatório.');
    }

    const logoFileName = await this.uploadsService.uploadArquivo(file);
    return this.parceirosService.create(createParceiroDto, logoFileName);
  }

  @Get()
  findAll() {
    return this.parceirosService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parceirosService.remove(id);
  }
}