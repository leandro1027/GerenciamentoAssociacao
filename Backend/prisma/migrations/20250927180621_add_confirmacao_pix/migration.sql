-- CreateEnum
CREATE TYPE "StatusDoacao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'REJEITADA');

-- AlterTable
ALTER TABLE "Doacao" ADD COLUMN     "status" "StatusDoacao" NOT NULL DEFAULT 'PENDENTE';
