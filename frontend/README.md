# Frontend – Onboarding Digital

Este diretório contém o frontend do projeto **Onboarding Digital**, desenvolvido com **Next.js**, **TypeScript** e **Tailwind CSS**.

A aplicação frontend será responsável pela interface do usuário, navegação entre telas e comunicação com o backend da aplicação.

## Tecnologias Utilizadas

* **Next.js**: framework React utilizado para criação da aplicação web.
* **TypeScript**: utilizado para adicionar tipagem ao JavaScript e tornar o código mais seguro.
* **Tailwind CSS**: utilizado para estilização rápida e padronizada das interfaces.
* **Node.js**: ambiente necessário para execução do projeto.
* **npm**: gerenciador de pacotes utilizado no projeto.

## Pré-requisitos

Antes de rodar o projeto, é necessário ter instalado:

* Node.js
* npm

Para verificar se estão instalados, execute:

```bash
node -v
npm -v
```

## Como instalar o projeto

Acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

## Como rodar o projeto

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

Após executar o comando, acesse no navegador:

```bash
http://localhost:3000
```

## Scripts disponíveis

| Comando         | Descrição                                               |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento.                   |
| `npm run build` | Gera a versão de produção da aplicação.                 |
| `npm run start` | Executa a versão de produção após o build.              |
| `npm run lint`  | Verifica possíveis problemas de padronização no código. |

## Estrutura inicial

A estrutura inicial do frontend foi gerada com o Next.js e organizada para permitir a evolução da aplicação durante as próximas etapas do projeto.

```text
frontend/
├── app/
├── public/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## Organização do desenvolvimento

Durante o desenvolvimento, as telas, componentes e estilos da aplicação serão organizados de forma progressiva, seguindo a arquitetura definida pela equipe.

A proposta é manter o código separado por responsabilidades, facilitando a manutenção, reutilização de componentes e colaboração entre os integrantes.

## Observações

Este frontend faz parte do projeto **Onboarding Digital** e ainda está em fase inicial de desenvolvimento. Novas páginas, componentes e integrações com o backend serão adicionadas nas próximas etapas.
