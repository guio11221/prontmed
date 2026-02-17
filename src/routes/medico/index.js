import { Router } from "express";
import MedicoController from "../../controllers/medicos/MedicoController.js";

/**
 * @class MainRouter
 * @description Roteador principal que agrega todos os módulos da aplicação (ex: Pacientes, Consultas, Usuários, etc.).
 */
class MainRouter {
  constructor() {
    /**
     * @property {Router} router
     * Instância principal do Express Router.
     */
    this.router = Router();
    this.medico = MedicoController;

    this.initializeRoutes();
  }

  /**
   * @method initializeRoutes
   * @description Inicializa e registra os módulos principais de rotas da aplicação.
   */
  initializeRoutes() {
    this.router.put("/preferences", this.medico.updatePreferences);
    this.router.post("/", this.medico.create);
    this.router.get("/", this.medico.getAll);
    this.router.get("/:id", this.medico.getById);
    this.router.put("/:id", this.medico.update);
    this.router.delete("/:id", this.medico.delete);
  }
}

export default new MainRouter().router;
