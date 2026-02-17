import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export default class PacientesControllers {

  async GetAllPaciente(req, res, next) {
    const pacientes = await prisma.paciente.findMany({
      include: {
        agendas: {
          orderBy: { data: 'desc' },
          take: 1
        }
      }
    });

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
        include: {
          agendas: {
            orderBy: { data: 'desc' },
            take: 1
          }
        }
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

  async GetPacienteFicha(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash("erro", "ID inválido.");
        return res.redirect("/pacientes");
      }

      const paciente = await prisma.paciente.findUnique({
        where: { id },
        include: {
          agendas: {
            orderBy: { data: 'desc' },
            include: { medico: true }
          }
        }
      });

      if (!paciente) {
        req.flash("erro", "Paciente não encontrado.");
        return res.redirect("/pacientes");
      }

      return res.render("pacientes/ficha", {
        user: req.user,
        paciente,
        title: `Ficha: ${paciente.nome}`,
        erro: req.flash("erro"),
        sucesso: req.flash("sucesso")
      });
    } catch (error) {
      console.error("Erro ao buscar ficha:", error);
      req.flash("erro", "Erro interno do servidor.");
      return res.redirect("/pacientes");
    }
  }

  async UpdatePaciente(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const {
        nome, cpf, nascimento, telefone, email, foto, tipoSanguineo, alergias,
        cep, logradouro, numero, complemento, bairro, cidade, estado
      } = req.body;

      await prisma.paciente.update({
        where: { id },
        data: {
          nome,
          cpf,
          nascimento: new Date(nascimento),
          telefone,
          email,
          foto,
          tipoSanguineo,
          alergias,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado
        }
      });

      req.flash("sucesso", "Cadastro atualizado com sucesso.");
      return res.redirect(`/pacientes/${id}/ficha`);
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      if (error.code === 'P2002') {
        req.flash("erro", "CPF já cadastrado para outro paciente.");
      } else {
        req.flash("erro", "Erro ao atualizar cadastro.");
      }
      return res.redirect(`/pacientes/${req.params.id}/ficha`);
    }
  }
}
