import { Controller, Get, Body, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ConteudoHomeService } from './conteudo-home.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateConteudoHomeDto } from './dto/update-conteudo-home.dto';
import { UploadService } from 'src/uploads-s3/upload.service';


// REMOVIDO: 'diskStorage' e 'extname' não são mais necessários aqui

@Controller('conteudo-home')
export class ConteudoHomeController {
  constructor(
    private readonly conteudoHomeService: ConteudoHomeService,
    private readonly uploadsService: UploadService, // ADICIONADO: Injeta o serviço de upload
  ) {}

  @Get()
  find() {
    return this.conteudoHomeService.findOrCreate();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  // MODIFICADO: Interceptor simplificado para usar a memória, sem configurações
  @UseInterceptors(FileInterceptor('file'))
  async update( // ADICIONADO: 'async' pois o upload é uma operação assíncrona
    @Body() dto: UpdateConteudoHomeDto, 
    @UploadedFile() file?: Express.Multer.File, // MODIFICADO: O arquivo é opcional
  ) {
    let imagemFileName: string | undefined = undefined;

    // MODIFICADO: Se um novo arquivo foi enviado, faz o upload
    if (file) {
      imagemFileName = await this.uploadsService.uploadArquivo(file);
    }
    
    // O DTO é passado diretamente, e o nome do arquivo separadamente
    return this.conteudoHomeService.update(dto, imagemFileName);
  }
}