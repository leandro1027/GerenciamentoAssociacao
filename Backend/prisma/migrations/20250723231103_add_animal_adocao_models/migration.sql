-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "animalImageUrl" TEXT,
    "descricao" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "porte" TEXT NOT NULL,
    "idade" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Adocao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataSolicitacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFinalizacao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SOLICITADA',
    "observacoesAdmin" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "animalId" TEXT NOT NULL,
    CONSTRAINT "Adocao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Adocao_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Adocao_usuarioId_animalId_key" ON "Adocao"("usuarioId", "animalId");
