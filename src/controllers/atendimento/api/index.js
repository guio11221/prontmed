import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export default class AtendimentoApiController {

    async atendimentoPaciente(req, res, next) {
        try {
            const { pacienteId, medicoId, dataAtendimento, horaAtendimento, observacoes } = req.body;

            const newAtendimento = await prisma.atendimento.create({
                data: {
                    pacienteId: parseInt(pacienteId),
                    medicoId: parseInt(medicoId),
                    dataAtendimento: new Date(dataAtendimento),
                    horaAtendimento: horaAtendimento,
                    observacoes: observacoes,
                },
            });

            res.status(201).json(newAtendimento);
        } catch (error) {
            console.error("Erro ao criar atendimento:", error);
            res.status(500).json({ error: "Erro ao criar atendimento" });
        }
    }
}