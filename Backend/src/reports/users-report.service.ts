// src/reports/users-report.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportColumn } from './reports.service';

@Injectable()
export class UsersReportService {
  constructor(private prisma: PrismaService) {}

  getColumns(): ReportColumn[] {
    return [
      { key: 'nome', header: 'Nome', width: 180 },
      { key: 'email', header: 'E-mail', width: 200 },
    ];
  }

  async getData() {
    const users = await this.prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
    });

    return users.map((user) => ({
      nome: user.nome,
      email: user.email,
    }));
  }
}