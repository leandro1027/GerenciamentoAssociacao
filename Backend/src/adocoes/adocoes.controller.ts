import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { AdocoesService } from './adocoes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';
import { UpdateAdocaoStatusDto } from './dto/update-adocao-status.dto';

@Controller('adocoes')
export class AdocoesController {
  constructor(private readonly adocoesService: AdocoesService) {}

  // Rota para um usuario criar um pedido de adoção
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAdocaoDto: CreateAdocoeDto, @Request() req) {
    const userId = req.user.id;
    return this.adocoesService.create(createAdocaoDto, userId);
  }

  // Rota para o usuario ver os seus próprios pedidos
  @UseGuards(JwtAuthGuard)
  @Get('meus-pedidos')
  findMyAdoptions(@Request() req) {
    const userId = req.user.id;
    return this.adocoesService.findAllForUser(userId);
  }

  // Rota para o admin ver TODOS os pedidos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.adocoesService.findAllForAdmin();
  }

  // Rota para o admin aprovar ou recusar um pedido
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdocaoStatusDto: UpdateAdocaoStatusDto,
  ) {
    return this.adocoesService.updateStatus(id, updateAdocaoStatusDto.status);
  }
}
