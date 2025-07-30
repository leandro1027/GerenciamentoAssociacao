// Em: Backend/src/parceiros/parceiros.module.ts

import { Module } from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { ParceirosController } from './parceiros.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParceirosController],
  providers: [ParceirosService],
})
export class ParceirosModule {}
