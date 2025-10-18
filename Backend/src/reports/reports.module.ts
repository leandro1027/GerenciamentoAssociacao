import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsService } from './reports.service';
import { DonationsReportService } from './donations-report.service';
import { AnimalsReportService } from './animals-report.service';
import { AdoptionsReportService } from './adoptions-report.service';
import { UsersReportService } from './users-report.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, DonationsReportService, AnimalsReportService,
    AdoptionsReportService,
    UsersReportService], 
})
export class ReportsModule {}