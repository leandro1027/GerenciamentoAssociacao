import { Injectable } from '@nestjs/common';
import { CreateGamificacaoDto } from './dto/create-gamificacao.dto';
import { UpdateGamificacaoDto } from './dto/update-gamificacao.dto';

@Injectable()
export class GamificacaoService {
  create(createGamificacaoDto: CreateGamificacaoDto) {
    return 'This action adds a new gamificacao';
  }

  findAll() {
    return `This action returns all gamificacao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gamificacao`;
  }

  update(id: number, updateGamificacaoDto: UpdateGamificacaoDto) {
    return `This action updates a #${id} gamificacao`;
  }

  remove(id: number) {
    return `This action removes a #${id} gamificacao`;
  }
}
