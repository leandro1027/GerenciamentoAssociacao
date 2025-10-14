import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusDoacao } from '@prisma/client';
import { ReportColumn } from '../reports/reports.service'; // 🔹 Import do tipo

@Injectable()
export class DonationsReportService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Define colunas do relatório com tipos corretos
  getColumns(): ReportColumn[] {
    return [
      { key: 'nomeDoador', header: 'Nome do Doador', width: 250, align: 'left' },
      { key: 'valor', header: 'Valor (R$)', width: 100, align: 'right' },
      { key: 'data', header: 'Data', width: 120, align: 'center' },
    ];
  }

  // 🔹 Busca e formata dados
  async getData() {
    const confirmedDonations = await this.prisma.doacao.findMany({
      where: { status: StatusDoacao.CONFIRMADA },
      include: { usuario: { select: { nome: true } } },
      orderBy: { data: 'desc' },
    });

    return confirmedDonations.map((donation) => ({
      nomeDoador: donation.usuario?.nome || 'Doação Anônima',
      valor: donation.valor.toFixed(2).replace('.', ','),
      data: new Date(donation.data).toLocaleDateString('pt-BR'),
    }));
  }
}
