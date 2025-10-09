import { Router } from "express";
import AgendaController from "../../controllers/agenda/index.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import api from "./api/index.js";

class MainRouter {
  constructor() {
    this.router = Router();
    this.agendaCtrl = new AgendaController();
    this.initializeRoutes();
  }

  /**
   * @method initializeRoutes
   * @description Inicializa e registra as rotas da Agenda.
   */
  initializeRoutes() {

    this.router.get("/agenda", authMiddleware, (req, res, next) => this.agendaCtrl.get(req, res, next));
    this.router.post("/agenda", authMiddleware, (req, res, next) => this.agendaCtrl.create(req, res, next));
    this.router.put("/agenda/:id", authMiddleware, (req, res, next) => this.agendaCtrl.update(req, res, next));
    this.router.delete("/agenda/:id", authMiddleware, (req, res, next) => this.agendaCtrl.delete(req, res, next));
    this.router.get('/agenda/:id', this.agendaCtrl.getById)
    this.router.use('/', authMiddleware, api);
  }
}

export default new MainRouter().router;
