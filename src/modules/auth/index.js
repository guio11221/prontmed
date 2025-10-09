import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import passport from "passport";

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "senha",
      passReqToCallback: true,
    },
    async function (req, email, senha, done) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email } });

        // 1. Verifica se o usuário existe
        if (!user) {
          return done(null, false, { message: "Email ou senha incorretos!" });
        }

        // 2. Compara a senha fornecida com a senha armazenada (hash)
        // Usamos user.senha? para garantir que a senha exista antes de comparar
        const isValidPassword = user.senha 
            ? await bcrypt.compare(senha, user.senha) 
            : false;
        
        // Se a senha for válida, autentica o usuário
        if (isValidPassword) {
          return done(null, user);
        } else {
          // Senha incorreta
          return done(null, false, { message: "Email ou senha incorretos!" });
        }

      } catch (error) {
        console.error("Erro ao autenticar usuário:", error);
        return done(error);
      }
    }
  )
);

// --- Serialização e Desserialização (Mantidas) ---

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      return done(new Error(`Usuário não encontrado com ID ${id}`));
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});


export default passport;