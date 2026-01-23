import { Router } from "express";
import AtendimentoController from "../../controllers/atendimento/index.js";

class MainRouter {
    constructor() {

        this.router = Router();

        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', async (req, res, next) => AtendimentoController.prototype.get_page(req, res, next))
    }
}

export default new MainRouter().router;
