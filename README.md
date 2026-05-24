
# Digital Onboarding System

Sistema web para onboarding digital de colaboradores, desenvolvido para departamentos de RH realizarem o recebimento, gerenciamento e auditoria de documentos admissionais de forma segura e centralizada.

Projeto desenvolvido no projeto de extensão **AILAB Makers — UnB FCTE**.

---

# Objetivo do Projeto

O sistema tem como objetivo digitalizar o processo de admissão de novos colaboradores, permitindo:

- Cadastro e autenticação de usuários
- Upload de documentos admissionais
- Gerenciamento de documentos pelo RH
- Controle de acesso por perfil de usuário
- Registro de logs de auditoria
- Armazenamento seguro em nuvem

---

# Funcionalidades

## Colaborador (`employee`)
- Criar conta
- Fazer login
- Enviar documentos
- Visualizar apenas seus próprios documentos

## RH (`hr`)
- Fazer login
- Visualizar documentos de todos os colaboradores
- Gerenciar uploads
- Auditar ações realizadas no sistema

---

# Tecnologias Utilizadas

## Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- React Hook Form

## Backend
- Python 3.11
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- bcrypt

## Banco de Dados
- PostgreSQL 15

## Infraestrutura
- Docker
- Docker Compose
- Google Cloud Run
- Google Cloud Storage

## CI/CD
- GitHub Actions

---

# Fluxo de Desenvolvimento


### `main`
Branch estável do projeto.

### `Branches de Funcionalidades`

Cada funcionalidade deve ser desenvolvida em uma branch própria. Além disso, cada commit será feito na branch correspondente a sua funcionalidade. Nunca commitar diretamente na main.

---

# Convenção de Commits
Organização de Commits para melhor compreensão do projeto. 

## Funcionalidades
```bash
feat: create login page
```
## Correções
```bash
fix: validate jwt token
```

## Documentação
```bash
docs: update README
```

## Refatoração
```bash
refactor: reorganize backend structure
```

---

# Pré-requisitos

Antes de configurar o projeto, é necessário instalar:

## Node.js
https://nodejs.org/

## Python 3.11
https://www.python.org/

## Docker Desktop
https://www.docker.com/products/docker-desktop/

---

# Status do Projeto

🚧 Em desenvolvimento

---

# Integrantes

- Raissa Silva de Oliveira
- Guilherme Negreiros Pereira
- Nina Rosa Alves Amorim
- Eduardo Jesus Dal Pizzol
- Matheus Eiki Kimura Rezende 
- Thomaz Marra Martins 


---

# Licença

Projeto acadêmico desenvolvido para fins educacionais.
