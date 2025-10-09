-- DropIndex
DROP INDEX "EscalaTrabalho_medicoId_diaSemana_key";

-- CreateIndex
CREATE INDEX "EscalaTrabalho_medicoId_diaSemana_idx" ON "EscalaTrabalho"("medicoId", "diaSemana");
