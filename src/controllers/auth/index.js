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
                    return res.status(500).json({
                        success: false,
                        message: "Erro inesperado ao tentar fazer login."
                    });
                }

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: info?.message || "Credenciais inválidas."
                    });
                }

                req.logIn(user, (err) => {
                    if (err) {
                        console.error("Erro ao criar sessão:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Erro ao criar sessão."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Login realizado com sucesso"
                    });
                });
            })(req, res, next);
        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(500).json({
                success: false,
                message: "Erro inesperado ao tentar fazer login."
            });
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
