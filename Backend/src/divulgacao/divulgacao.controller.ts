import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Get, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DivulgacaoService } from './divulgacao.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('divulgacao')
export class DivulgacaoController {
  constructor(private readonly divulgacaoService: DivulgacaoService) {}

  // Endpoint PROTEGIDO para utilizadores logados enviarem uma divulgação
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

  // Endpoint para o ADMIN ver todas as divulgações
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.divulgacaoService.findAll();
  }
}
