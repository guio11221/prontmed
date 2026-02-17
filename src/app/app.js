import express from "express";
import path from "path";
import morgan from "morgan";
import flash from "server-connect.io";
import expressSession from "express-session";
import passport from "passport";
import expressEjsLayouts from "express-ejs-layouts";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { fileURLToPath } from "url";
import { PrismaClient } from '@prisma/client';

// Reconstrói __dirname no contexto ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


app.set('trust proxy', 1);

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // ms
        },
        secret: 'a santa at nasa',
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            new PrismaClient(),
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));
app.use(expressEjsLayouts);
app.set('layout', 'layouts/main');
// --- Arquivos Estáticos ---
app.use(express.static(path.join(__dirname, "../../public")));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.sucesso = req.flash("sucesso");
    res.locals.erro = req.flash("erro");
    res.locals.user = req.user || null;
    next();
});

export default app;