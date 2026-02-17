import { Router } from "express";
import PacientesControllers from "../../controllers/paciente/pacienteController.js";
import authMiddlewares from "../../middlewares/authMiddleware.js";
import PacientesApiControllers from '../../controllers/paciente/api/index.js'
/**
 * Esse módulo é responsável por listar os pacientes cadastrados no sistema.
 * Todas as rotas aqui definidas exigem autenticação prévia.
 */
class MainRouter {
  constructor() {
    this.router = Router();
    this.paciente = new PacientesControllers()
    this.paciente_api = new PacientesApiControllers()

    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", authMiddlewares, async (req, res, next) => await this.paciente.GetAllPaciente(req, res, next));
    this.router.get('/search', async (req, res, next) => await this.paciente_api.search(req, res, next));
    this.router.get('/api/:id', async (req, res, next) => await this.paciente_api.getById(req, res, next));
    this.router.get("/:id/ficha", authMiddlewares, async (req, res, next) => await this.paciente.GetPacienteFicha(req, res, next));
    this.router.post("/:id/update", authMiddlewares, async (req, res, next) => await this.paciente.UpdatePaciente(req, res, next));
    this.router.get('/:nome/:id', authMiddlewares, async (req, res, next) => await this.paciente.GetUnicPaciente(req, res, next));
  }
}

export default new MainRouter().router;
