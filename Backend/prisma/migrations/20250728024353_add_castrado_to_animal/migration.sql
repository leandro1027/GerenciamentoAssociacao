/*
  Warnings:

  - Added the required column `castrado` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "animalImageUrl" TEXT,
    "descricao" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "porte" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "idade" TEXT NOT NULL,
    "castrado" BOOLEAN NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Animal" ("animalImageUrl", "createdAt", "descricao", "disponivel", "especie", "id", "idade", "nome", "porte", "raca", "sexo", "status", "updatedAt") SELECT "animalImageUrl", "createdAt", "descricao", "disponivel", "especie", "id", "idade", "nome", "porte", "raca", "sexo", "status", "updatedAt" FROM "Animal";
DROP TABLE "Animal";
ALTER TABLE "new_Animal" RENAME TO "Animal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
