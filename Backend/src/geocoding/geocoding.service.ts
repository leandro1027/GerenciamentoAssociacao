// src/geocoding/geocoding.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Formata o endereço para ser usado numa URL
      const formattedAddress = encodeURIComponent(address);
      
      // Documentação da API do Nominatim: https://nominatim.org/release-docs/latest/api/Search/
      const url = `https://nominatim.openstreetmap.org/search?q=${formattedAddress}&format=json&limit=1`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SuaApp/1.0 SeuEmail@dominio.com' // É boa prática se identificar
        }
      });

      // Se encontrar resultados, retorna a latitude e longitude do primeiro
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }

      return null; // Nenhum resultado encontrado
    } catch (error) {
      console.error('Erro no serviço de Geocoding:', error);
      throw new Error('Não foi possível converter o endereço em coordenadas.');
    }
  }
  async getAddressFromCoordinates(lat: number, lng: number): Promise<{ address: string } | null> {
    try {
      // Documentação da API de Reverse Geocoding do Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SuaApp/1.0 SeuEmail@dominio.com',
          'Accept-Language': 'pt-BR,pt;q=0.9', // Pede o resultado em português
        }
      });

      // Se encontrar um resultado, retorna o endereço formatado
      if (response.data && response.data.display_name) {
        return { address: response.data.display_name };
      }

      return null;
    } catch (error) {
      console.error('Erro no serviço de Reverse Geocoding:', error);
      throw new Error('Não foi possível converter as coordenadas em endereço.');
    }
  }
}

