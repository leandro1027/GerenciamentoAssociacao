import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus,UseGuards } from '@nestjs/common';
import { DoacaoService } from './doacao.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doacao')
@UseGuards(JwtAuthGuard)
export class DoacaoController {
  constructor(private readonly doacaoService: DoacaoService) {}

  @Post()
  create(@Body() createDoacaoDto: CreateDoacaoDto) {
    return this.doacaoService.create(createDoacaoDto);
  }

  @Get()
  findAll() {
    return this.doacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDoacaoDto: UpdateDoacaoDto) {
    return this.doacaoService.update(id, updateDoacaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.remove(id);
  }
}
