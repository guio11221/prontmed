import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class AgendaController {
    constructor() { }

    async get(req, res, next) {
        try {
            const { date } = req.query;
            const user = req.user;
            let where = {};

            if (user && user.role !== "ADMIN") {
                if (user.id) {
                    where.medicoId = user.id;
                } else {
                    return res.json({ compromissos: [] });
                }
            }

            if (date) {
                const startOfDay = new Date(date + 'T00:00:00.000Z');
                const nextDay = new Date(startOfDay);
                nextDay.setDate(startOfDay.getDate() + 1);

                where.data = { gte: startOfDay, lt: nextDay };
            }

            const compromissos = await prisma.agenda.findMany({
                where,
                include: { paciente: true, medico: true },
                orderBy: { data: 'asc' }
            });

            if (req.xhr || req.headers['accept']?.includes('application/json') || date) {
                return res.json({ compromissos });
            }

            return res.render("agenda/agenda", {
                user: req.user,
                compromissos,
                title: 'Agenda',
                erro: req.flash("erro"),
                sucesso: req.flash("sucesso")
            });

        } catch (err) {
            console.error("Erro ao carregar agenda:", err.message);
            return res.status(500).json({ success: false, message: "Erro ao carregar agenda." });
        }
    }

    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = req.user;

            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: "ID de agendamento inválido." });
            }

            let whereCondition = { id };
            if (user.role !== "ADMIN") whereCondition.medicoId = user.id;

            const compromisso = await prisma.agenda.findUnique({
                where: whereCondition,
                include: { paciente: true, medico: true }
            });

            if (!compromisso) {
                return res.status(404).json({ success: false, message: "Agendamento não encontrado" });
            }

            return res.json({ success: true, agenda: compromisso });

        } catch (err) {
            console.error(`Erro ao buscar agendamento ${req.params.id}:`, err.message);
            return res.status(500).json({ success: false, message: "Erro interno ao buscar agendamento." });
        }
    }

    async create(req, res, next) {
        const {
            pacienteId,
            pacienteNome,
            pacienteCpf,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            medicoId,
            data,
            tipoConsulta,
            observacoes,
            status
        } = req.body;

        let finalPacienteId = pacienteId;

        try {
            if (!pacienteCpf || !pacienteNome || !medicoId || !data) {
                return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes." });
            }

            if (!finalPacienteId) {
                let paciente = await prisma.paciente.findUnique({ where: { cpf: pacienteCpf } });

                if (!paciente) {
                    paciente = await prisma.paciente.create({
                        data: {
                            nome: pacienteNome,
                            cpf: pacienteCpf,
                            cep,
                            logradouro,
                            numero,
                            complemento,
                            bairro,
                            cidade,
                            estado,
                            nascimento: new Date('1900-01-01'),
                        },
                    });
                }
                // We no longer update the patient's name/address here to prevent accidental global changes.
                // If a patient with this CPF exists, we use the existing record as-is.

                finalPacienteId = paciente.id;
            }

            if (!finalPacienteId) {
                return res.status(500).json({ success: false, message: "Falha ao identificar paciente." });
            }

            const novo = await prisma.agenda.create({
                data: {
                    pacienteId: parseInt(finalPacienteId),
                    medicoId: parseInt(medicoId),
                    data: new Date(data),
                    tipoConsulta: tipoConsulta || 'Consulta Padrão',
                    status: status || 'Agendado',
                    criadoPor: req.user.id
                },
                include: {
                    paciente: { select: { id: true, nome: true } },
                    medico: { select: { id: true, nome: true } }
                }
            });

            res.status(201).json({ success: true, agendamento: novo, message: "Agendamento criado com sucesso!" });

        } catch (err) {
            console.error("Erro ao criar agendamento:", err.message);
            if (err.code === 'P2002' && err.meta?.target.includes('cpf')) {
                return res.status(409).json({ success: false, message: "CPF já registrado." });
            }
            res.status(500).json({ success: false, message: `Erro ao criar agendamento: ${err.message}` });
        }
    }

    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: "ID inválido." });
            }

            const { data, tipoConsulta, status, observacoes } = req.body;

            const updateData = {};
            if (data) updateData.data = new Date(data);
            if (tipoConsulta) updateData.tipoConsulta = tipoConsulta;
            if (status) updateData.status = status;
            if (observacoes) updateData.observacoes = observacoes;

            const atualizado = await prisma.agenda.update({
                where: { id, ativo: true },
                data: updateData
            });

            res.json({ success: true, agenda: atualizado, message: "Agendamento atualizado com sucesso!" });
        } catch (err) {
            console.error(`Erro ao atualizar agendamento ${req.params.id}:`, err.message);
            if (err.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Agendamento não encontrado." });
            }
            res.status(500).json({ success: false, message: "Erro ao atualizar agendamento." });
        }
    }

    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: "ID inválido." });
            }

            const agendamentoCancelado = await prisma.agenda.update({
                where: { id },
                data: { status: 'Cancelado' }
            });

            res.json({
                success: true,
                message: "Agendamento cancelado com sucesso.",
                agendamento: agendamentoCancelado
            });

        } catch (err) {
            console.error(`Erro ao cancelar agendamento ${req.params.id}:`, err.message);
            if (err.code === 'P2025') {
                return res.status(404).json({ success: false, message: "Agendamento não encontrado." });
            }
            res.status(500).json({ success: false, message: "Erro ao cancelar agendamento." });
        }
    }
}
