# 🏥 OpenPront: Gestão de Prontuários e Agendamentos

## ✨ Visão Geral

O OpenPront é um sistema inovador e de código aberto, projetado para revolucionar a gestão de prontuários eletrônicos e o agendamento de consultas em clínicas e consultórios médicos. Com uma interface intuitiva e funcionalidades robustas, nosso objetivo é otimizar o fluxo de trabalho, facilitar a administração de informações de pacientes, agendamentos e históricos clínicos, promovendo uma gestão mais eficiente, segura e humanizada.

## 🚀 Status do Projeto

![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Funcionalidades Principais

*   **Paciente:** 🧑‍⚕️ Cadastro completo de pacientes, histórico médico detalhado, registro de alergias, medicamentos e exames.
*   **Agendamento:** 🗓️ Sistema de agendamento flexível com visualização de calendário intuitiva, opções de remarcação e cancelamento facilitadas.
*   **Prontuário:** 📝 Registro eletrônico detalhado de atendimentos, evolução clínica e prescrições médicas.
*   **Acesso:** 🔑 Controle de acesso baseado em perfis de usuário (médico, recepcionista, administrador) com diferentes níveis de permissão.
*   **Relatórios:** 📊 Geração de relatórios abrangentes sobre atendimentos, dados de pacientes e produtividade da clínica.

## 🛠️ Tecnologias Utilizadas

*   **Backend:** Node.js, Express.js
*   **Banco de Dados:** Prisma ORM, SQLite (para desenvolvimento/testes), PostgreSQL/MySQL (para produção)
*   **Frontend:** EJS (Embedded JavaScript), HTML5, CSS3, JavaScript
*   **Ferramentas:** Git, npm/yarn

## 📸 Telas do Sistema

Aqui você pode ver algumas das interfaces do OpenPront em ação.

### Tela de Login
![Tela de Login](docs/images/login/img.png)

[//]: # (### Tela de Agendamento)

[//]: # (![Tela de Agendamento]&#40;docs/images/agendamento/img.png&#41;)

[//]: # (*&#40;Lembre-se de substituir `agendamento/img.png` pelo caminho correto da sua imagem de agendamento&#41;*)

## ⚙️ Como Configurar e Rodar o Projeto

Siga os passos abaixo para configurar e executar o OpenPront em seu ambiente local.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
*   npm ou yarn
*   [Git](https://git-scm.com/)

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

## 💡 Uso

Após iniciar o servidor, acesse `http://localhost:3000` no seu navegador. Você poderá se cadastrar ou fazer login para começar a utilizar o sistema.

## 🤝 Contribuição

Contribuições são muito bem-vindas! Se você deseja contribuir para o projeto, por favor, siga os seguintes passos:

1.  Faça um fork do repositório.
2.  Crie uma nova branch para sua feature (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e commit (`git commit -m 'Adiciona nova feature'`).
4.  Envie para o branch original (`git push origin feature/sua-feature`).
5.  Abra um Pull Request detalhando suas mudanças.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ✉️ Contato

Para dúvidas, sugestões ou colaborações, entre em contato com Guilherme.

---

**Desenvolvido com ❤️ por [Guilherme](https://github.com/guio11221)**
