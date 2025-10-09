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
          nome: {
            contains: searchTerm,
            lte: "insensitive"
          }
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
}
