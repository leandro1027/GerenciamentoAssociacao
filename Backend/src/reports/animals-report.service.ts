// src/reports/animals-report.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportColumn } from './reports.service';

@Injectable()
export class AnimalsReportService {
  constructor(private prisma: PrismaService) {}

  getColumns(): ReportColumn[] {
    return [
      { key: 'nome', header: 'Nome', width: 120 },
      { key: 'especie', header: 'Espécie', width: 80 },
      { key: 'raca', header: 'Raça', width: 100 },
      { key: 'status', header: 'Status', width: 80 },
      { key: 'dataCadastro', header: 'Data de Cadastro', width: 120, align: 'center' },
    ];
  }

  async getData() {
    const animals = await this.prisma.animal.findMany({
      orderBy: { nome: 'asc' },
    });

    return animals.map((animal) => ({
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca,
      status: animal.status, // Você pode querer formatar isso (ex: 'DISPONIVEL' -> 'Disponível')
      dataCadastro: new Date(animal.createdAt).toLocaleDateString('pt-BR'),
    }));
  }
}