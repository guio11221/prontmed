import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import passport from "../../modules/auth/index.js";

const prisma = new PrismaClient();

export default class AuthController {
    constructor() {}

    async authPage(req, res, next) {
        try {
            res.render("login/page", {title: "Login", erro: req.flash("erro"), sucesso: req.flash("sucesso") });
        } catch (error) {
            console.error("Erro ao carregar página de login:", error);
            res.status(500).send("Erro interno ao carregar login.");
        }
    }

    async login(req, res, next) {
        try {

            passport.authenticate("local", (err, user, info) => {
            if (err) {
              console.error("Erro na autenticação:", err);
              req.flash("erro", "Erro inesperado ao tentar fazer login.");
              return res.redirect("/login");
            }
    
            if (!user) {
              req.flash("erro", info.message); 
              return res.redirect("/login");
            }
    
            req.logIn(user, (err) => {
              if (err) {
                console.error("Erro ao criar sessão:", err);
                req.flash("erro", "Erro inesperado ao tentar criar sessão.");
                return res.redirect("/login");
              }
    
              return res.redirect("/agenda");
            });
          })(req, res, next);
    
        } catch (error) {
          console.error("Erro no login:", error);
          req.flash("erro", "Erro inesperado ao tentar fazer login.");
          res.redirect("/login");
        }
      }

    async logout(req, res, next) {
        try {
            req.logout(() => {
                req.flash("sucesso", "Logout realizado com sucesso.");
                res.redirect("/login");
            });
        } catch (error) {
            console.error("Erro no logout:", error);
            req.flash("erro", "Erro ao encerrar sessão.");
            res.redirect("/pacientes");
        }
    }
}
