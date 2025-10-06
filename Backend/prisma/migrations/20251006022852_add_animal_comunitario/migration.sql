-- CreateEnum
CREATE TYPE "StatusDoacao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('CAO', 'GATO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'FEMEA');

-- CreateEnum
CREATE TYPE "Porte" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('DISPONIVEL', 'EM_PROCESSO_ADOCAO', 'ADOTADO');

-- CreateEnum
CREATE TYPE "StatusAdocao" AS ENUM ('SOLICITADA', 'EM_ANALISE', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "DivulgacaoStatus" AS ENUM ('PENDENTE', 'REVISADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "TipoRecompensa" AS ENUM ('CASTRACAO', 'VACINACAO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "telefone" TEXT,
    "profileImageUrl" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "divulgacoes_aprovadas" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(2) NOT NULL DEFAULT 'SC',
    "cidade" TEXT NOT NULL DEFAULT 'Não informado',
    "pontos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "animalImageUrl" TEXT,
    "descricao" TEXT NOT NULL,
    "especie" "Especie" NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "porte" "Porte" NOT NULL,
    "raca" TEXT NOT NULL,
    "idade" TEXT NOT NULL,
    "castrado" BOOLEAN NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusAnimal" NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "comunitario" BOOLEAN NOT NULL DEFAULT false,
    "localizacaoComunitaria" TEXT,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalComunitario" (
    "id" TEXT NOT NULL,
    "nomeTemporario" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalComunitario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adocao" (
    "id" TEXT NOT NULL,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFinalizacao" TIMESTAMP(3),
    "status" "StatusAdocao" NOT NULL DEFAULT 'SOLICITADA',
    "observacoesAdmin" TEXT,
    "tipoMoradia" TEXT,
    "outrosAnimais" TEXT,
    "tempoDisponivel" TEXT,
    "motivoAdocao" TEXT,
    "recompensa_concedida" BOOLEAN NOT NULL DEFAULT false,
    "recompensa_detalhes" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "animalId" TEXT NOT NULL,

    CONSTRAINT "Adocao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doacao" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusDoacao" NOT NULL DEFAULT 'PENDENTE',
    "usuarioId" INTEGER,

    CONSTRAINT "Doacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Divulgacao" (
    "id" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "castrado" BOOLEAN NOT NULL,
    "resgate" BOOLEAN NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "DivulgacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Divulgacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voluntario" (
    "id" SERIAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Voluntario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteudoHome" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "itens" TEXT NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConteudoHome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parceiro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "gamificacaoAtiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conquista" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "pontosBonus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Conquista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioConquista" (
    "dataDeGanho" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "conquistaId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioConquista_pkey" PRIMARY KEY ("usuarioId","conquistaId")
);

-- CreateTable
CREATE TABLE "Recompensa" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoRecompensa" NOT NULL,
    "dataConcessao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalhes" TEXT,
    "adocaoId" TEXT NOT NULL,

    CONSTRAINT "Recompensa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Adocao_usuarioId_animalId_key" ON "Adocao"("usuarioId", "animalId");

-- CreateIndex
CREATE UNIQUE INDEX "Voluntario_usuarioId_key" ON "Voluntario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Conquista_nome_key" ON "Conquista"("nome");

-- AddForeignKey
ALTER TABLE "Adocao" ADD CONSTRAINT "Adocao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adocao" ADD CONSTRAINT "Adocao_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divulgacao" ADD CONSTRAINT "Divulgacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voluntario" ADD CONSTRAINT "Voluntario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioConquista" ADD CONSTRAINT "UsuarioConquista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioConquista" ADD CONSTRAINT "UsuarioConquista_conquistaId_fkey" FOREIGN KEY ("conquistaId") REFERENCES "Conquista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recompensa" ADD CONSTRAINT "Recompensa_adocaoId_fkey" FOREIGN KEY ("adocaoId") REFERENCES "Adocao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
