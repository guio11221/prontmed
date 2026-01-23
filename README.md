# OpenPront

## Visão Geral

O OpenPront é um sistema de gestão de prontuários eletrônicos e agendamento de consultas, desenvolvido para otimizar o fluxo de trabalho em clínicas e consultórios médicos. Com uma interface intuitiva e funcionalidades robustas, o OpenPront visa facilitar a administração de informações de pacientes, agendamentos e históricos clínicos, promovendo uma gestão mais eficiente e segura.

## Funcionalidades Principais (Exemplos)

*   **Gestão de Pacientes:** Cadastro completo de pacientes, histórico médico, alergias, medicamentos e exames.
*   **Agendamento de Consultas:** Sistema de agendamento flexível com visualização de calendário, remarcação e cancelamento.
*   **Prontuário Eletrônico:** Registro detalhado de atendimentos, evolução clínica e prescrições.
*   **Controle de Acesso:** Perfis de usuário com diferentes níveis de permissão (médico, recepcionista, administrador).
*   **Relatórios:** Geração de relatórios sobre atendimentos, pacientes e produtividade.

## Tecnologias Utilizadas (Exemplos)

*   **Backend:** Node.js, Express.js
*   **Banco de Dados:** Prisma ORM, SQLite (para desenvolvimento/testes), PostgreSQL/MySQL (para produção)
*   **Frontend:** EJS (Embedded JavaScript), HTML5, CSS3, JavaScript
*   **Outras Ferramentas:** Git, npm/yarn

## Telas do Sistema

### Tela de Login
![Tela de Login](docs/images/login/img.png)

## Como Configurar e Rodar o Projeto

Siga os passos abaixo para configurar e executar o OpenPront em seu ambiente local.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   Node.js (versão LTS recomendada)
*   npm ou yarn
*   Git

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/openpront.git
    cd openpront
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuração do Banco de Dados:**
    O projeto utiliza Prisma ORM. Para configurar o banco de dados:

    *   Crie um arquivo `.env` na raiz do projeto com a string de conexão do seu banco de dados. Exemplo para SQLite (já configurado no `prisma/schema.prisma`):
        ```
        DATABASE_URL="file:./prisma/openpront.db"
        ```
    *   Execute as migrações do Prisma para criar o esquema do banco de dados:
        ```bash
        npx prisma migrate dev --name init
        ```

4.  **Inicialize o Projeto:**
    ```bash
    npm start
    # ou
    yarn start
    ```

    O servidor estará rodando em `http://localhost:3000` (ou a porta configurada).

## Uso

Após iniciar o servidor, acesse `http://localhost:3000` no seu navegador. Você poderá se cadastrar ou fazer login para começar a utilizar o sistema.

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir, por favor, siga os seguintes passos:

1.  Faça um fork do repositório.
2.  Crie uma nova branch (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e commit (`git commit -m 'Adiciona nova feature'`).
4.  Envie para o branch original (`git push origin feature/sua-feature`).
5.  Abra um Pull Request.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ por Guilherme**
