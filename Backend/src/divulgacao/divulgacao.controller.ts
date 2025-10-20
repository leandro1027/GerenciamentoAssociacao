import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Get, UseGuards, Request, Param, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DivulgacaoService } from './divulgacao.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateAnimalDivulgacaoDto } from 'src/animal/dto/update-animal-divulgacao.dto';
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';
import { UploadService } from 'src/uploads-s3/upload.service';


@Controller('divulgacao')
export class DivulgacaoController {
  constructor(
    private readonly divulgacaoService: DivulgacaoService,
    private readonly uploadsService: UploadService, 
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // MODIFICADO
  async create( // MODIFICADO
    @Body() createDivulgacaoDto: CreateDivulgacaoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }
    const userId = req.user.id;
    
    // MODIFICADO: Delega o upload para o serviço central
    const imageUrl = await this.uploadsService.uploadArquivo(file);

    return this.divulgacaoService.create(createDivulgacaoDto, imageUrl, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.divulgacaoService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimalDivulgacaoDto: UpdateAnimalDivulgacaoDto,
  ) {
    return this.divulgacaoService.updateStatus(id, updateAnimalDivulgacaoDto.status);
  }

  @Post(':id/convert-to-animal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  convertToAnimal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() convertDto: ConvertDivulgacaoDto,
  ) {
    return this.divulgacaoService.convertToAnimal(id, convertDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.divulgacaoService.remove(id);
  }
}