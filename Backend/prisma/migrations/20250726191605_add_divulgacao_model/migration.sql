-- CreateTable
CREATE TABLE "Divulgacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "castrado" BOOLEAN NOT NULL,
    "resgate" BOOLEAN NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "descricao" TEXT,
    "contatoNome" TEXT NOT NULL,
    "contatoTelefone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
