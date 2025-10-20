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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// REMOVIDO: 'diskStorage' e 'extname' não são mais necessários aqui
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';
import { UploadService } from 'src/uploads-s3/upload.service';


// REMOVIDO: A função de gerar nome de arquivo agora é responsabilidade do UploadsService
// const generateUniqueFilename = (file: Express.Multer.File) => { ... };

@Controller('animais-comunitarios')
export class AnimaisComunitariosController {
  constructor(
    private readonly animaisComunitariosService: AnimaisComunitariosService,
    private readonly uploadsService: UploadService, // ADICIONADO: Injeta o serviço de upload
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  // MODIFICADO: O FileInterceptor agora usa armazenamento em memória, sem configurações complexas.
  @UseInterceptors(FileInterceptor('file'))
  async create( // ADICIONADO: 'async' pois agora aguardamos o upload
    @Body() createDto: CreateAnimalComunitarioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O ficheiro da imagem do animal é obrigatório.');
    }

    // MODIFICADO: A lógica de upload é delegada ao serviço central
    const fotoFileName = await this.uploadsService.uploadArquivo(file);

    // Passamos apenas o nome do arquivo para o serviço de negócio
    return this.animaisComunitariosService.create(createDto, fotoFileName);
  }

  // --- NENHUMA ALTERAÇÃO NECESSÁRIA ABAIXO DESTE PONTO NO CONTROLLER ---
  // (Exceto no método 'update' que também lida com arquivos)

  @Get('mapa/localizacoes') 
  findAllForMap() {
    return this.animaisComunitariosService.findAllForMap();
  }

  @Get()
  findAll(@Query('search') searchTerm?: string) {
    return this.animaisComunitariosService.findAll(searchTerm);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  // MODIFICADO: Interceptor simplificado, igual ao do 'create'
  @UseInterceptors(FileInterceptor('file'))
  async update( // ADICIONADO: 'async'
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAnimalComunitarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fotoFileName: string | undefined = undefined;

    // MODIFICADO: Se um novo arquivo for enviado, faz o upload
    if (file) {
      fotoFileName = await this.uploadsService.uploadArquivo(file);
    }
    
    return this.animaisComunitariosService.update(id, updateDto, fotoFileName);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animaisComunitariosService.remove(id);
  }
}