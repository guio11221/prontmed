import { Router } from "express";
import pacientes from "./pacientes/pacientes.js";
import AUTH from "./auth/index.js";
import agenda from "./agenda/index.js";
import medico from "./medico/index.js";

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

    this.initializeRoutes();
  }

  /**
   * @method initializeRoutes
   * @description Inicializa e registra os módulos principais de rotas da aplicação.
   */
  initializeRoutes() {
    /**
     * 
     */
    this.router.use("/", AUTH)
    /**
     * @route /pacientes
     * @group Pacientes
     * @description Registra todas as rotas do módulo de pacientes (listar, criar, editar, excluir, etc.).
     * @access Privado
     */
    this.router.use("/pacientes", pacientes);
    /**
     * 
     */
    this.router.use("/medicos", medico)
    /**
     * 
     */
    this.router.use("/", agenda)
  }
}

export default new MainRouter().router;
