import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('configuracao')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas as rotas
export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  // Rota para o admin buscar a configuração atual
  @Get()
  find() {
    return this.configuracaoService.find();
  }

  // Rota para o admin atualizar a configuração
  @Patch()
  update(@Body() updateConfiguracaoDto: UpdateConfiguracaoDto) {
    return this.configuracaoService.update(updateConfiguracaoDto);
  }
}