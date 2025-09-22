import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { CreateGamificacaoDto } from './dto/create-gamificacao.dto';
import { UpdateGamificacaoDto } from './dto/update-gamificacao.dto';

@Controller('gamificacao')
export class GamificacaoController {
  constructor(private readonly gamificacaoService: GamificacaoService) {}

  @Post()
  create(@Body() createGamificacaoDto: CreateGamificacaoDto) {
    return this.gamificacaoService.create(createGamificacaoDto);
  }

  @Get()
  findAll() {
    return this.gamificacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamificacaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGamificacaoDto: UpdateGamificacaoDto) {
    return this.gamificacaoService.update(+id, updateGamificacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamificacaoService.remove(+id);
  }
}
