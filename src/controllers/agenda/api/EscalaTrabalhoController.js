import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class EscalaTrabalhoController {
  async create(req, res, next) {
    const userIdLogado = req.user?.id;
    const userRole = req.user?.role;

    if (!userIdLogado) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (userRole !== "MEDICO") {
      return res.status(403).json({ message: "Apenas médicos podem criar escalas." });
    }

    const medicoIdReal = userIdLogado;
    const { diaSemana, horaInicio, horaFim, duracaoConsulta } = req.body;

    if (diaSemana === undefined || !horaInicio || !horaFim) {
      return res.status(400).json({ message: "Dia e horários da escala são obrigatórios." });
    }

    const diaSemanaInt = parseInt(diaSemana);
    const duracaoConsultaInt = duracaoConsulta ? parseInt(duracaoConsulta) : 30;

    try {
      const escalaAtivaExistente = await prisma.escalaTrabalho.findFirst({
        where: {
          medicoId: medicoIdReal,
          diaSemana: diaSemanaInt,
          ativo: true
        }
      });

      if (escalaAtivaExistente) {
        return res.status(409).json({
          message: "O médico já possui uma escala ativa para este dia. Inative a anterior antes de criar uma nova."
        });
      }

      const novaEscala = await prisma.escalaTrabalho.create({
        data: {
          medicoId: medicoIdReal,
          diaSemana: diaSemanaInt,
          horaInicio,
          horaFim,
          duracaoConsulta: duracaoConsultaInt,
          ativo: true
        }
      });

      return res.status(201).json({
        success: true,
        message: "Escala criada com sucesso.",
        escala: novaEscala
      });
    } catch (error) {
      if (error.code === "P2003" || error.name === "PrismaClientValidationError") {
        return res.status(400).json({ message: "Erro de dados. Verifique o formato dos horários." });
      }
      console.error("Erro ao criar escala:", error);
      return res.status(500).json({ message: "Erro interno ao salvar escala." });
    }
  }

  async getByMedico(req, res, next) {
    const { medicoId } = req.params;

    try {
      const escalas = await prisma.escalaTrabalho.findMany({
        where: { medicoId: parseInt(medicoId), ativo: true },
        orderBy: { diaSemana: "asc" }
      });

      return res.status(200).json({ success: true, escalas });
    } catch (error) {
      console.error("Erro ao buscar escalas:", error);
      return res.status(500).json({ message: "Erro interno ao buscar escalas." });
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const data = req.body;

    try {
      const escalaAtualizada = await prisma.escalaTrabalho.update({
        where: { id: parseInt(id) },
        data: {
          diaSemana: data.diaSemana ? parseInt(data.diaSemana) : undefined,
          horaInicio: data.horaInicio,
          horaFim: data.horaFim,
          duracaoConsulta: data.duracaoConsulta ? parseInt(data.duracaoConsulta) : undefined
        }
      });

      return res.status(200).json({
        success: true,
        message: "Escala atualizada com sucesso.",
        escala: escalaAtualizada
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Já existe uma escala para este dia da semana." });
      }
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Escala não encontrada." });
      }
      console.error("Erro ao atualizar escala:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar escala." });
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;

    try {
      await prisma.escalaTrabalho.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });

      return res.status(200).json({
        success: true,
        message: "Escala inativada com sucesso."
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Escala não encontrada." });
      }
      console.error("Erro ao inativar escala:", error);
      return res.status(500).json({ message: "Erro interno ao inativar escala." });
    }
  }

}

export default new EscalaTrabalhoController();
