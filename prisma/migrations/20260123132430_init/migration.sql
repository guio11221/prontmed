/*
  Warnings:

  - You are about to drop the column `observacoes` on the `Agenda` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ConsultaObservacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agendaId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "observacao" TEXT NOT NULL,
    "dataRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultaObservacao_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConsultaObservacao_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agenda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "tipoConsulta" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Agendado',
    "criadoPor" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Agenda_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agenda_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agenda_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Agenda" ("criadoEm", "criadoPor", "data", "id", "medicoId", "pacienteId", "status", "tipoConsulta") SELECT "criadoEm", "criadoPor", "data", "id", "medicoId", "pacienteId", "status", "tipoConsulta" FROM "Agenda";
DROP TABLE "Agenda";
ALTER TABLE "new_Agenda" RENAME TO "Agenda";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
