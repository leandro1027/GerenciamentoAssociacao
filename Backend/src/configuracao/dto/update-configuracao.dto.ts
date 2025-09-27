import { IsBoolean } from 'class-validator';

export class UpdateConfiguracaoDto {
  @IsBoolean({ message: 'O valor de gamificacaoAtiva deve ser um booleano (true ou false).' })
  gamificacaoAtiva: boolean;
}