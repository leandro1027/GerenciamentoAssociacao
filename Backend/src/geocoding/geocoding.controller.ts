import { Controller, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('search')
  async searchAddress(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('O parâmetro "address" é obrigatório.');
    }

    const coordinates = await this.geocodingService.getCoordinatesFromAddress(address);

    if (!coordinates) {
      throw new NotFoundException('Não foi possível encontrar coordenadas para o endereço fornecido.');
    }

    return coordinates;
  }
}