import app from "./src/app/app.js";
import router from "./src/routes/index.js";

app.use(router);

/**
 * @middleware 404 Handler
 * @description Middleware global para capturar requisições a rotas inexistentes.
 * Retorna resposta JSON padronizada com status de erro e possível rota de redirecionamento.
 */
app.use((_, res, __) => {
  return res.status(404).redirect('/agenda')
});

 
const PORT = 3000;

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
