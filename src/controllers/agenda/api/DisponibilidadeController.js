import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class DisponibilidadeController {

    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static minutesToTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    static generateSlots(escala) {
        const slots = new Set();
        const inicioMin = DisponibilidadeController.timeToMinutes(escala.horaInicio);
        const fimMin = DisponibilidadeController.timeToMinutes(escala.horaFim);
        const duracao = escala.duracaoConsulta; // em minutos

        for (let currentMin = inicioMin; (currentMin + duracao) <= fimMin; currentMin += duracao) {
            slots.add(DisponibilidadeController.minutesToTime(currentMin));
        }

        return slots;
    }

    async get(req, res, next) {
        const medicoId = parseInt(req.params.medicoId);
        const dateString = req.query.date;

        if (!medicoId || !dateString) {
            return res.status(400).json({ message: "ID do médico e data são obrigatórios." });
        }

        try {
 
            const dateObj = new Date(dateString + 'T00:00:00'); 
            const diaSemana = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); 

             const escalas = await prisma.escalaTrabalho.findMany({
                where: {
                    medicoId: medicoId,
                    diaSemana: diaSemana,
                },
                orderBy: { horaInicio: 'asc' }
            });

            if (escalas.length === 0) {
                return res.json({ slotsLivres: [] });
            }

    
            const startOfDay = new Date(dateString + 'T00:00:00.000Z');
            const endOfDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);  

            const agendamentos = await prisma.agenda.findMany({
                where: {
                    medicoId: medicoId,
                    data: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                    status: {
                        notIn: ['Cancelado', 'Faltou']  
                    }
                },
                select: { data: true }
            });
            
             const slotsOcupados = new Set();
            agendamentos.forEach(agendamento => {
                const hours = agendamento.data.getUTCHours();
                const minutes = agendamento.data.getUTCMinutes();
                
                const agendamentoTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                slotsOcupados.add(agendamentoTime);
            });

             let todosSlotsPossiveis = new Set();
            
            escalas.forEach(escala => {
                const slotsDaEscala = DisponibilidadeController.generateSlots(escala);
                slotsDaEscala.forEach(slot => todosSlotsPossiveis.add(slot));
            });

            const slotsLivres = Array.from(todosSlotsPossiveis)
                .filter(slot => !slotsOcupados.has(slot))
                .sort();  

            return res.json({ slotsLivres });

        } catch (error) {
            console.error("Erro ao calcular disponibilidade:", error);
            next(error); 
        }
    }
}

export default new DisponibilidadeController();