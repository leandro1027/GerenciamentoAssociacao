-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "passwordResetExpires" DATETIME;
ALTER TABLE "Usuario" ADD COLUMN "passwordResetToken" TEXT;
