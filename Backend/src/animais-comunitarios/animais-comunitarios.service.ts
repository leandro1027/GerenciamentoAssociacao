import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnimalComunitarioDto } from './dto/create-animais-comunitario.dto';
import { UpdateAnimalComunitarioDto } from './dto/update-animais-comunitario.dto';

@Injectable()
export class AnimaisComunitariosService {
  constructor(private readonly prisma: PrismaService) {}

  // MODIFICADO: A assinatura do método agora espera uma string `fotoFileName`
  async create(createDto: CreateAnimalComunitarioDto, fotoFileName: string) {
    // A lógica interna apenas salva a string no campo correto do banco de dados
    return this.prisma.animalComunitario.create({
      data: {
        ...createDto,
        imageUrl: fotoFileName, // Assumindo que o campo no seu schema se chama 'foto'
      },
    });
  }

  // Nenhuma alteração em 'findAll', 'findAllForMap' e 'findOne'
  findAll(searchTerm?: string) { /* ...código existente... */ }
  findAllForMap() { /* ...código existente... */ }
  async findOne(id: string) { /* ...código existente... */ }

  // MODIFICADO: A assinatura também muda aqui para receber uma string opcional
  async update(
    id: string,
    updateDto: UpdateAnimalComunitarioDto,
    fotoFileName?: string,
  ) {
    await this.findOne(id); // Validação existente é mantida

    const dataToUpdate: any = { ...updateDto };

    // MODIFICADO: Se um novo nome de arquivo foi passado, ele é adicionado para atualização
    if (fotoFileName) {
      dataToUpdate.foto = fotoFileName;
      // TODO: Implementar a lógica para deletar a foto antiga da Cloudflare R2
    }

    return this.prisma.animalComunitario.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Validação existente é mantida
    // TODO: Antes de deletar, buscar o nome da foto no DB para deletá-la da Cloudflare R2
    return this.prisma.animalComunitario.delete({
      where: { id },
    });
  }
}