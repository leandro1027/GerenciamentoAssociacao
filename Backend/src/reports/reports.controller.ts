import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
import { DonationsReportService } from './donations-report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private donationsReportService: DonationsReportService,
  ) {}

  @Get('donations/csv')
  async exportDonationsCsv(@Res() res: Response) {
    const data = await this.donationsReportService.getData();
    this.reportsService.generateCsv(res, 'relatorio_doacoes.csv', data);
  }

  @Get('donations/pdf')
  async exportDonationsPdf(@Res() res: Response) {
    const columns = this.donationsReportService.getColumns();
    const data = await this.donationsReportService.getData();
    this.reportsService.generatePdf(
      res,
      'relatorio_doacoes.pdf',
      'Relatório de Doações',
      columns,
      data,
    );
  }
}
