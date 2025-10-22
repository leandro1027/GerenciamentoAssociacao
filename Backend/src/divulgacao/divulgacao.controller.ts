import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  UseGuards,
  Request,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DivulgacaoService } from './divulgacao.service';
import { CreateDivulgacaoDto } from './dto/create-divulgacao.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
// Renomeado para não conflitar com o DTO do AnimalService, mas o nome está correto no contexto
import { ConvertDivulgacaoDto } from './dto/convert-divulgacao.dto';
import { UploadsService } from 'src/uploads-s3/upload.service'; // <-- Injeção necessária
import { Express } from 'express'; // Importação explícita do tipo Multer
import { UpdateDivulgacaoStatusDto } from './dto/update-divulgacao-status.dto';

@Controller('divulgacao')
export class DivulgacaoController {
  constructor(
    private readonly divulgacaoService: DivulgacaoService,
    // UploadsService é injetado para ser chamado explicitamente no 'create'
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Apenas usuários logados podem criar
  @UseInterceptors(FileInterceptor('file')) // Intercepta o campo 'file' do FormData
  async create(
    @Body() createDivulgacaoDto: CreateDivulgacaoDto,
    @UploadedFile() file: Express.Multer.File, // Usa o tipo importado
    @Request() req, // Para obter o ID do usuário logado
  ) {
    // Validação básica do arquivo
    if (!file) {
      throw new BadRequestException(
        'O ficheiro da imagem do animal é obrigatório.',
      );
    }
    const userId = req.user.id; // Assume que o JwtAuthGuard popula req.user com { id, email, ... }

    // Chama explicitamente o serviço de upload para enviar ao R2 e obter o nome do arquivo
    const imageUrl = await this.uploadsService.uploadArquivo(file);
    if (!imageUrl) {
        throw new BadRequestException('Falha ao processar o upload da imagem.');
    }

    // Passa o DTO, o nome do arquivo e o ID do usuário para o serviço criar no banco
    return this.divulgacaoService.create(createDivulgacaoDto, imageUrl, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Apenas ADMINs podem ver todas as divulgações
  findAll() {
    return this.divulgacaoService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Apenas ADMINs podem mudar o status
  @HttpCode(HttpStatus.OK) // Retorna 200 OK por padrão em PATCH
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string, // Valida se o ID é um UUID
    @Body() updateDivulgacaoStatusDto: UpdateDivulgacaoStatusDto, // Usa o DTO específico
  ) {
    // Passa apenas o status para o serviço
    return this.divulgacaoService.updateStatus(
      id,
      updateDivulgacaoStatusDto.status,
    );
  }

  @Post(':id/convert-to-animal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Apenas ADMINs podem converter
  @HttpCode(HttpStatus.CREATED) // Retorna 201 Created pois cria um novo recurso (Animal)
  convertToAnimal(
    @Param('id', ParseUUIDPipe) id: string, // Valida ID
    @Body() convertDto: ConvertDivulgacaoDto, // DTO com os dados do novo animal
  ) {
    return this.divulgacaoService.convertToAnimal(id, convertDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Apenas ADMINs podem deletar
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content em caso de sucesso
  async remove(@Param('id', ParseUUIDPipe) id: string) { // Adicionado async
    await this.divulgacaoService.remove(id); // Chama o serviço para deletar
    // Não retorna nada no corpo da resposta
  }
}