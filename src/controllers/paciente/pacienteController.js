import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export default class PacientesControllers {

  async GetAllPaciente(req, res, next) {
    const pacientes = await prisma.paciente.findMany();
    return res.render("pacientes/listar", { 
      user: req.user, 
      pacientes, 
      title: "Pacientes", 
      erro: req.flash("erro"), 
      sucesso: req.flash("sucesso") 
    });
  }

  async GetUnicPaciente(req, res, next) {
    try {
      const { nome, id } = req.params;
  
      if (!id) {
        req.flash("erro", "ID do paciente não informado.");
        return res.redirect("/agendas");
      }
  
      const paciente = await prisma.paciente.findUnique({
        where: { id: Number(id) },
      });
  
      if (!paciente || (nome && paciente.nome !== nome)) {
        req.flash("erro", "Nenhum paciente encontrado com os dados informados.");
        return res.redirect("/agendas");
      }
  
      return res.render("pacientes/listar", {
        user: req.user,
        pacientes: [paciente],
        title: "Pacientes",
        erro: req.flash("erro"),
        sucesso: req.flash("sucesso"),
      });
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      req.flash("erro", "Erro interno do servidor. Tente novamente mais tarde.");
      return res.redirect("/agendas");
    }
  }
  

}
