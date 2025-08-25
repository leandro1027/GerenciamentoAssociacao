import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationsReportService {
  constructor(private prisma: PrismaService) {}

  // Define as colunas para o relatório de doações
  getColumns() {
    return [
      { key: 'id', header: 'ID' },
      { key: 'usuario.nome', header: 'Nome do Doador', width: 150 },
      { key: 'valor', header: 'Valor (R$)' },
      { key: 'data', header: 'Data' },
    ];
  }

  // Busca e formata os dados para o relatório de doações
  async getData() {
    const donations = await this.prisma.doacao.findMany({
      include: {
        usuario: { select: { nome: true } },
      },
      orderBy: { data: 'desc' },
    });

    return donations.map(d => ({
      ...d,
      valor: d.valor.toFixed(2).replace('.', ','),
      data: new Date(d.data).toLocaleDateString('pt-BR'),
    }));
  }
}