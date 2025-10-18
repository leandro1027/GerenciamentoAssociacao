import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
import { DonationsReportService } from './donations-report.service';
// --- INÍCIO: NOVOS IMPORTS ---
import { AnimalsReportService } from './animals-report.service';
import { AdoptionsReportService } from './adoptions-report.service';
import { UsersReportService } from './users-report.service';
// --- FIM: NOVOS IMPORTS ---

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private donationsReportService: DonationsReportService,
    // --- INÍCIO: NOVAS INJEÇÕES DE SERVIÇO ---
    private animalsReportService: AnimalsReportService,
    private adoptionsReportService: AdoptionsReportService,
    private usersReportService: UsersReportService,
    // --- FIM: NOVAS INJEÇÕES DE SERVIÇO ---
  ) {}

  // --- Relatórios de Doações (Já existentes) ---
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

  // --- INÍCIO: NOVOS ENDPOINTS ---

  // --- Relatórios de Animais ---
  @Get('animals/csv')
  async exportAnimalsCsv(@Res() res: Response) {
    const data = await this.animalsReportService.getData();
    this.reportsService.generateCsv(res, 'relatorio_animais.csv', data);
  }

  @Get('animals/pdf')
  async exportAnimalsPdf(@Res() res: Response) {
    const columns = this.animalsReportService.getColumns();
    const data = await this.animalsReportService.getData();
    this.reportsService.generatePdf(res, 'relatorio_animais.pdf', 'Relatório de Animais', columns, data);
  }

  // --- Relatórios de Adoções ---
  @Get('adoptions/csv')
  async exportAdoptionsCsv(@Res() res: Response) {
    const data = await this.adoptionsReportService.getData();
    this.reportsService.generateCsv(res, 'relatorio_adocoes.csv', data);
  }

  @Get('adoptions/pdf')
  async exportAdoptionsPdf(@Res() res: Response) {
    const columns = this.adoptionsReportService.getColumns();
    const data = await this.adoptionsReportService.getData();
    this.reportsService.generatePdf(res, 'relatorio_adocoes.pdf', 'Relatório de Adoções', columns, data);
  }

  // --- Relatórios de Usuários ---
  @Get('users/csv')
  async exportUsersCsv(@Res() res: Response) {
    const data = await this.usersReportService.getData();
    this.reportsService.generateCsv(res, 'relatorio_usuarios.csv', data);
  }

  @Get('users/pdf')
  async exportUsersPdf(@Res() res: Response) {
    const columns = this.usersReportService.getColumns();
    const data = await this.usersReportService.getData();
    this.reportsService.generatePdf(res, 'relatorio_usuarios.pdf', 'Relatório de Usuários', columns, data);
  }

}