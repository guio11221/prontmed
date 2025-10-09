import { Router } from "express";
import AuthController from "../../controllers/auth/index.js";

/**
 * @class MainRouter
 * @description Define todas as rotas principais do sistema, incluindo autenticação e módulos do prontuário.
 */
class MainRouter {
  constructor() {
    /** 
     * @property {Router} router
     * Instância principal do Express Router.
     */
    this.router = Router();

    /**
     * @property {AuthController} auth
     * Controlador responsável por login, registro e logout.
     */
    this.auth = new AuthController();

    this.initializeRoutes();
  }

  /**
   * @method initializeRoutes
   * @description Inicializa e registra todas as rotas principais da aplicação.
   */
  initializeRoutes() {
    /**
     * @route GET /login
     * @group Autenticação
     * @description Exibe a página de login do sistema.
     * @access Público
     */
    this.router.get("/login", (req, res, next) => this.auth.authPage(req, res, next));

    /**
     * @route POST /login
     * @group Autenticação
     * @description Realiza o processo de autenticação do usuário via Passport.js.
     * @access Público
     */
    this.router.post("/login", (req, res, next) => this.auth.login(req, res, next));

    /**
     * @route GET /logout
     * @group Autenticação
     * @description Encerra a sessão do usuário autenticado.
     * @access Privado
     */
    this.router.get("/logout", (req, res, next) => this.auth.logout(req, res, next));

  }
}

export default new MainRouter().router;
