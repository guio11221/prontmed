import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class MedicoController {
  async updatePreferences(req, res, next) {
    const { preferences } = req.body;
    const userId = req.user.id;

    if (!preferences) {
      return res.status(400).json({ message: "Preferências não informadas." });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { preferences }
      });

      return res.status(200).json({
        success: true,
        message: "Preferências atualizadas com sucesso.",
        preferences: user.preferences
      });
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar preferências." });
    }
  }

  async create(req, res, next) {
    const { nome, cpf, nascimento, telefone, endereco, email } = req.body;

    if (!nome || !cpf || !nascimento) {
      return res.status(400).json({ message: "Nome, CPF e Data de Nascimento são obrigatórios." });
    }

    try {
      const novoPaciente = await prisma.paciente.create({
        data: {
          nome,
          cpf,
          nascimento: new Date(nascimento),
          telefone,
          endereco,
          email
        }
      });

      return res.status(201).json({
        success: true,
        message: "Paciente cadastrado com sucesso.",
        paciente: novoPaciente
      });
    } catch (error) {
      if (error.code === "P2002" && error.meta.target.includes("cpf")) {
        return res.status(409).json({ message: "CPF já cadastrado." });
      }
      console.error("Erro ao cadastrar paciente:", error);
      return res.status(500).json({ message: "Erro interno ao cadastrar paciente." });
    }
  }

  async getAll(req, res, next) {
    try {
      const pacientes = await prisma.paciente.findMany({
        orderBy: { nome: "asc" },
        include: { _count: { select: { agendas: true } } }
      });

      return res.status(200).json({ success: true, pacientes });
    } catch (error) {
      console.error("Erro ao listar pacientes:", error);
      return res.status(500).json({ message: "Erro interno ao listar pacientes." });
    }
  }

  async getById(req, res, next) {
    const { id } = req.params;

    try {
      const paciente = await prisma.paciente.findUnique({
        where: { id: parseInt(id) },
        include: { agendas: true }
      });

      if (!paciente) {
        return res.status(404).json({ message: "Paciente não encontrado." });
      }

      return res.status(200).json({ success: true, paciente });
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      return res.status(500).json({ message: "Erro interno ao buscar paciente." });
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const { nome, cpf, nascimento, telefone, endereco, email } = req.body;

    try {
      const dataToUpdate = {
        nome,
        cpf,
        nascimento: nascimento ? new Date(nascimento) : undefined,
        telefone,
        endereco,
        email
      };

      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: parseInt(id) },
        data: dataToUpdate
      });

      return res.status(200).json({
        success: true,
        message: "Dados do paciente atualizados com sucesso.",
        paciente: pacienteAtualizado
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Paciente não encontrado." });
      }
      if (error.code === "P2002" && error.meta.target.includes("cpf")) {
        return res.status(409).json({ message: "O CPF fornecido já está em uso por outro paciente." });
      }
      console.error("Erro ao atualizar paciente:", error);
      return res.status(500).json({ message: "Erro interno ao atualizar paciente." });
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;

    try {
      await prisma.$transaction([
        prisma.agenda.deleteMany({ where: { pacienteId: parseInt(id) } }),
        prisma.paciente.delete({ where: { id: parseInt(id) } })
      ]);

      return res.status(200).json({
        success: true,
        message: "Paciente e seus agendamentos foram deletados com sucesso."
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Paciente não encontrado." });
      }
      console.error("Erro ao deletar paciente:", error);
      return res.status(500).json({ message: "Erro interno ao deletar paciente." });
    }
  }
}

export default new MedicoController();
