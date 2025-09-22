-- DropForeignKey
ALTER TABLE "Doacao" DROP CONSTRAINT "Doacao_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Doacao" ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
