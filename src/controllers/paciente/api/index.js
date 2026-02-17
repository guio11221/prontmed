import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export default class PacientesApiControllers {

  async search(req, res, next) {
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(200).json({ success: true, pacientes: [] });
    }

    try {
      const pacientes = await prisma.paciente.findMany({
        where: {
          OR: [
            { nome: { contains: searchTerm } },
            { cpf: { contains: searchTerm } }
          ]
        },
        take: 10,
        orderBy: { nome: "asc" }
      });

      return res.status(200).json({
        success: true,
        pacientes
      });
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      return res.status(500).json({ message: "Erro interno ao buscar pacientes." });
    }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "ID inválido" });

      const paciente = await prisma.paciente.findUnique({
        where: { id }
      });

      if (!paciente) return res.status(404).json({ success: false, message: "Paciente não encontrado" });

      return res.status(200).json({ success: true, paciente });
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }
}
