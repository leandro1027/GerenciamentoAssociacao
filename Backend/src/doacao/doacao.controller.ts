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
  UseInterceptors, // Importado para interceptar a requisição
  UploadedFile,    // Importado para acessar o arquivo
  BadRequestException, // Importado para tratar erros
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importado para interceptar arquivos
import { diskStorage } from 'multer'; // Importado para configurar o armazenamento
import { extname } from 'path'; // Importado para extrair a extensão do arquivo
import { DoacaoService } from './doacao.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto';

// NOVO: Helper para gerar nomes de arquivo únicos e seguros
export const uniqueFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0].replace(/\s/g, '_'); // Remove espaços
  const fileExtName = extname(file.originalname);
  const randomName = Array(16)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller('doacao')
export class DoacaoController {
  constructor(private readonly doacaoService: DoacaoService) {}

  // ROTA ALTERADA: Agora registra a doação com o comprovante obrigatório.
  @Post()
  @UseInterceptors(FileInterceptor('comprovante', { // 1. Intercepta o campo 'comprovante'
    storage: diskStorage({
      destination: './uploads',      // 2. Define a pasta de destino
      filename: uniqueFileName,      // 3. Define um nome de arquivo único
    }),
    fileFilter: (req, file, callback) => { // 4. Valida a extensão do arquivo
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(
          new BadRequestException('Apenas arquivos de imagem (JPG, PNG) ou PDF são permitidos!'),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 5, // Limite de 5 MB
    },
  }))
  create(
    @Body() createDoacaoDto: CreateDoacaoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O envio do comprovante é obrigatório.');
    }
    // Passa o DTO e o arquivo para o service
    return this.doacaoService.create(createDoacaoDto, file);
  }

  // --- ROTAS DE ADMINISTRAÇÃO (sem alterações) ---

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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