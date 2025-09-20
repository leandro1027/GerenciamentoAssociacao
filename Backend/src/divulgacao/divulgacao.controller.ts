import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Get, UseGuards, Request, Param, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DivulgacaoService } from './divulgacao.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateAnimalDivulgacaoDto } from 'src/animal/dto/update-animal-divulgacao.dto';
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto'; // <-- Importado o DTO que criamos

@Controller('divulgacao')
export class DivulgacaoController {
  constructor(private readonly divulgacaoService: DivulgacaoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))

  create(
    @Body() createDivulgacaoDto: CreateDivulgacaoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }
    const userId = req.user.id;
    return this.divulgacaoService.create(createDivulgacaoDto, file, userId);
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

  // --- MÉTODO ATUALIZADO ---
  @Post(':id/convert-to-animal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  convertToAnimal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() convertDto: ConvertDivulgacaoDto, // <-- 1. Recebe os dados do formulário
  ) {
    // 2. Passa os dados para o serviço
    return this.divulgacaoService.convertToAnimal(id, convertDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.divulgacaoService.remove(id);
  }
}