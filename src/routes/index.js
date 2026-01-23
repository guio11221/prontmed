import { Router } from "express";
import pacientes from "./pacientes/pacientes.js";
import AUTH from "./auth/index.js";
import agenda from "./agenda/index.js";
import medico from "./medico/index.js";
import atendimento from './atendimento/index.js'

class MainRouter {
  constructor() {

    this.router = Router();

    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use("/", AUTH)
    this.router.use("/pacientes", pacientes);
    this.router.use("/medicos", medico);
    this.router.use('/atendimento', atendimento)
    this.router.use("/", agenda)
  }
}

export default new MainRouter().router;
