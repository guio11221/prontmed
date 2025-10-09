-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EscalaTrabalho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicoId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "duracaoConsulta" INTEGER NOT NULL DEFAULT 30,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "EscalaTrabalho_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EscalaTrabalho" ("diaSemana", "duracaoConsulta", "horaFim", "horaInicio", "id", "medicoId") SELECT "diaSemana", "duracaoConsulta", "horaFim", "horaInicio", "id", "medicoId" FROM "EscalaTrabalho";
DROP TABLE "EscalaTrabalho";
ALTER TABLE "new_EscalaTrabalho" RENAME TO "EscalaTrabalho";
CREATE UNIQUE INDEX "EscalaTrabalho_medicoId_diaSemana_key" ON "EscalaTrabalho"("medicoId", "diaSemana");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
