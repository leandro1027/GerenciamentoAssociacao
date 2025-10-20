import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DoacaoService } from './doacao.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto';
import { UploadService } from 'src/uploads-s3/upload.service';


// REMOVIDO: A função de gerar nome de arquivo agora é responsabilidade do UploadsService
// export const uniqueFileName = (req, file, callback) => { ... };

@Controller('doacao')
export class DoacaoController {
  constructor(
    private readonly doacaoService: DoacaoService,
    private readonly uploadsService: UploadService, // ADICIONADO
  ) {}

  @Post()
  // MODIFICADO: Interceptor simplificado para usar a memória
  @UseInterceptors(FileInterceptor('comprovante'))
  async create( // ADICIONADO: 'async'
    @Body() createDoacaoDto: CreateDoacaoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O envio do comprovante é obrigatório.');
    }
    
    // MODIFICADO: Delega o upload para o serviço central
    const comprovanteFileName = await this.uploadsService.uploadArquivo(file);

    return this.doacaoService.create(createDoacaoDto, comprovanteFileName);
  }

  // --- ROTAS DE ADMINISTRAÇÃO (sem alterações) ---

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.doacaoService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoacaoStatusDto: UpdateDoacaoStatusDto,
  ) {
    return this.doacaoService.updateStatus(id, updateDoacaoStatusDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoacaoDto: UpdateDoacaoDto,
  ) {
    return this.doacaoService.update(id, updateDoacaoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.remove(id);
  }
}