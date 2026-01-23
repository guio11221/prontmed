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

        if (!user) {
          return done(null, false, { message: "Email ou senha incorretos!" });
        }

        const isValidPassword = user.senha 
            ? await bcrypt.compare(senha, user.senha) 
            : false;
        
        if (isValidPassword) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Email ou senha incorretos!" });
        }

      } catch (error) {
        console.error("Erro ao autenticar usuário:", error);
        return done(error);
      }
    }
  )
);

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