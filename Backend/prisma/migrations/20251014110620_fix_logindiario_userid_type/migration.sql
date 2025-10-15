-- CreateTable
CREATE TABLE "LoginDiario" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "LoginDiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginDiario_usuarioId_data_key" ON "LoginDiario"("usuarioId", "data");

-- AddForeignKey
ALTER TABLE "LoginDiario" ADD CONSTRAINT "LoginDiario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
