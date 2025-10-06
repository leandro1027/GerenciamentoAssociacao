/*
  Warnings:

  - You are about to drop the column `cidade` on the `AnimalComunitario` table. All the data in the column will be lost.
  - You are about to drop the column `rua` on the `AnimalComunitario` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `AnimalComunitario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `AnimalComunitario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnimalComunitario" DROP COLUMN "cidade",
DROP COLUMN "rua",
ADD COLUMN     "enderecoCompleto" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
