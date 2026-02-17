/*
  Warnings:

  - You are about to drop the column `endereco` on the `Paciente` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" DATETIME NOT NULL,
    "telefone" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "email" TEXT,
    "foto" TEXT DEFAULT '',
    "tipoSanguineo" TEXT DEFAULT '',
    "alergias" TEXT DEFAULT ''
);
INSERT INTO "new_Paciente" ("alergias", "cpf", "email", "foto", "id", "nascimento", "nome", "telefone", "tipoSanguineo") SELECT "alergias", "cpf", "email", "foto", "id", "nascimento", "nome", "telefone", "tipoSanguineo" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
CREATE UNIQUE INDEX "Paciente_cpf_key" ON "Paciente"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
