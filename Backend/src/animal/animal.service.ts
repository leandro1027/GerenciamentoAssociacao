import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusAnimal } from 'generated/prisma';

@Injectable()
export class AnimalService {
  constructor (private readonly prisma:PrismaService){}

  create(createAnimalDto: CreateAnimalDto, file: Express.Multer.File) {
    // Cria o caminho relativo que será guardado no banco de dados
    const animalImageUrl = `/uploads/${file.filename}`;

    return this.prisma.animal.create({
      data: {
        ...createAnimalDto,
        animalImageUrl: animalImageUrl, // Adiciona o caminho da imagem aos dados
      },
    });
  }

  findAll(disponivel?: boolean) {
    const whereClause = disponivel ? { status: StatusAnimal.DISPONIVEL } : {};

    return this.prisma.animal.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: {id},
    });

    if(!animal){
      throw new NotFoundException(`Animal com ID "${id}" não encontrado.`)
    }

    return animal;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findOne(id);

    return this.prisma.animal.update({
      where: {id},
      data: updateAnimalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Adicional: Lógica para apagar o ficheiro de imagem do disco (opcional)
    // const animal = await this.findOne(id);
    // if (animal.animalImageUrl) {
    //   // fs.unlinkSync(`.${animal.animalImageUrl}`);
    // }

    return this.prisma.animal.delete({
      where: {id},
    });
  }
}
