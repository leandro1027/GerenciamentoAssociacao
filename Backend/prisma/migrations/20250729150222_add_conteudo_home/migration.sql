-- CreateTable
CREATE TABLE "ConteudoHome" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "itens" TEXT NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
