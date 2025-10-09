import { Router } from "express";
// Ajuste o caminho de importação conforme a sua estrutura de projeto real.
import EscalaTrabalhoController from "../../../controllers/agenda//api/EscalaTrabalhoController.js"; 
import authMiddleware from "../../../middlewares/authMiddleware.js";
import DisponibilidadeController from "../../../controllers/agenda/api/DisponibilidadeController.js";

class EscalaRouter { // Mudei o nome para EscalaRouter para clareza, já que ele lida com escalas
    constructor() {
        this.router = Router();
        // O Controller não precisa ser instanciado aqui (new...), pois ele já foi exportado
        // como uma instância única (export default new EscalaTrabalhoController()) no arquivo do Controller.
        this.escalaCtrl = EscalaTrabalhoController; 
        this.initializeRoutes();
    }

    /**
     * @method initializeRoutes
     * @description Inicializa e registra as rotas da Escala de Trabalho (CRUD).
     */
    initializeRoutes() {
        const auth = authMiddleware; // Reutilizando o middleware de autenticação
        this.router.get("/escalas/:medicoId", auth, (req, res, next) => this.escalaCtrl.getByMedico(req, res, next));
        this.router.post("/escalas", auth, (req, res, next) => this.escalaCtrl.create(req, res, next));
        this.router.put("/escalas/:id", auth, (req, res, next) => this.escalaCtrl.update(req, res, next));
        this.router.delete("/escalas/:id", auth, (req, res, next) => this.escalaCtrl.delete(req, res, next));
        this.router.get('/disponibilidade/:medicoId', DisponibilidadeController.get); 
    }
}

// Se você estiver usando um arquivo separado APENAS para as rotas de Escala:
export default new EscalaRouter().router; 