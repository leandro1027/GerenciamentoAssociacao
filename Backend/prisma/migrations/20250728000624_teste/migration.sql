/*
  Warnings:

  - You are about to drop the column `contatoNome` on the `Divulgacao` table. All the data in the column will be lost.
  - You are about to drop the column `contatoTelefone` on the `Divulgacao` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `Divulgacao` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Divulgacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "castrado" BOOLEAN NOT NULL,
    "resgate" BOOLEAN NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Divulgacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Divulgacao" ("castrado", "createdAt", "descricao", "id", "imageUrl", "localizacao", "raca", "resgate", "status") SELECT "castrado", "createdAt", "descricao", "id", "imageUrl", "localizacao", "raca", "resgate", "status" FROM "Divulgacao";
DROP TABLE "Divulgacao";
ALTER TABLE "new_Divulgacao" RENAME TO "Divulgacao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
