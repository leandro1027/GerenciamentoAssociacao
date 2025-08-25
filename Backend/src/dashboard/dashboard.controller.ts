import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ATUALIZADO: para corresponder ao seu padrão
import { RolesGuard } from '../auth/roles.guard';     // ATUALIZADO: para corresponder ao seu padrão
import { Roles } from '../auth/roles.decorator';       // ATUALIZADO: para corresponder ao seu padrão

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('ADMIN')                     
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
