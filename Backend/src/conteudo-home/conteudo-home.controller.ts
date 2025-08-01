import { Controller, Get, Body, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ConteudoHomeService } from './conteudo-home.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateConteudoHomeDto } from './dto/update-conteudo-home.dto';


@Controller('conteudo-home')
export class ConteudoHomeController {
  constructor(private readonly conteudoHomeService: ConteudoHomeService) {}

  @Get()
  find() {
    return this.conteudoHomeService.findOrCreate();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  update(@Body() dto: UpdateConteudoHomeDto, @UploadedFile() file: Express.Multer.File) {
    const parsedDto = {
        titulo: dto.titulo,
        subtitulo: dto.subtitulo,
        itens: dto.itens,
    };
    return this.conteudoHomeService.update(parsedDto, file);
  }
}
