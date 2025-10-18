// src/reports/adoptions-report.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportColumn } from './reports.service';

@Injectable()
export class AdoptionsReportService {
  constructor(private prisma: PrismaService) {}

  getColumns(): ReportColumn[] {
    return [
      { key: 'animalNome', header: 'Animal', width: 150 },
      { key: 'adotanteNome', header: 'Adotante', width: 200 },
      { key: 'status', header: 'Status', width: 100 },
    ];
  }

  async getData() {
    const adoptions = await this.prisma.adocao.findMany({
      include: {
        animal: { select: { nome: true } },
        usuario: { select: { nome: true } },
      },
    });

    return adoptions.map((adocao) => ({
      animalNome: adocao.animal.nome,
      adotanteNome: adocao.usuario.nome,
      status: adocao.status,
    }));
  }
}