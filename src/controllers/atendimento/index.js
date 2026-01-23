import { PrismaClient } from "@prisma/client";
import pacientes from "../../routes/pacientes/pacientes.js";
const prisma = new PrismaClient();

export default class AtendimentoController {

    async get_page(req, res, next) {
        try {
            const { pacienteId, dataAtendimento } = req.query;

            if (!pacienteId || !dataAtendimento) {
                return res.render('atendimento/page', {
                    infoAtendimento: [],
                    title: "Atendimento - Page"
                });
            }

            const dataInput = new Date(dataAtendimento); // aceita ISO completo

            const inicioDia = new Date(dataInput);
            inicioDia.setUTCHours(0, 0, 0, 0);

            const fimDia = new Date(dataInput);
            fimDia.setUTCHours(23, 59, 59, 999);

            const agendamento = await prisma.agenda.findFirst({
                where: {
                    pacienteId: Number(pacienteId),
                    data: {
                        gte: inicioDia,
                        lte: fimDia
                    }
                },
                include: {
                    paciente: true,
                    medico: true
                }
            });

            return res.render('atendimento/page', {
                agendamento ,
                title: "Atendimento - Page"
            });

        } catch (e) {
            console.error(e);
            return res.status(500).send("Erro ao carregar atendimento");
        }
    }
}
