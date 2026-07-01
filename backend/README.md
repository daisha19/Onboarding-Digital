# Backend

API do projeto **OnBoarding Digital**, responsável pelas regras de negócio, autenticação, autorização, persistência de dados e integrações necessárias para o fluxo de admissão digital.

## Objetivo

O backend centraliza a lógica do sistema e expõe endpoints para o frontend. Ele deve garantir que colaboradores acessem apenas seus próprios documentos e que usuários de RH possam acompanhar, aprovar, rejeitar ou solicitar reenvio dos documentos enviados.

## Stack Prevista

| Tecnologia | Uso |
|---|---|
| Python | Linguagem principal da API |
| FastAPI | Framework para criação dos endpoints |
| SQLAlchemy | ORM para comunicação com o banco |
| Alembic | Migrações e versionamento do schema |
| PostgreSQL | Banco de dados relacional |
| Docker | Padronização do ambiente de execução |

## Responsabilidades

- Autenticar usuários com e-mail e senha.
- Gerar e validar tokens de autenticação.
- Aplicar controle de acesso por perfil (`employee` e `hr`).
- Gerenciar usuários, documentos, status e metadados.
- Validar tipo e tamanho de arquivos enviados.
- Registrar eventos de auditoria, como login, upload, download e validação de documentos.
- Integrar armazenamento de documentos em nuvem quando necessário.

## Estrutura Sugerida

```text
backend/
├── app/
│   ├── api/            # Rotas e controllers
│   ├── core/           # Configurações, segurança e dependências comuns
│   ├── models/         # Modelos SQLAlchemy
│   ├── schemas/        # Schemas Pydantic
│   ├── services/       # Regras de negócio
│   └── main.py         # Entrada da aplicação FastAPI
├── tests/              # Testes automatizados
├── requirements.txt    # Dependências Python
└── README.md
```

Essa estrutura pode ser ajustada conforme a implementação evoluir.

## Variáveis de Ambiente

As variáveis devem ser documentadas no `.env.example` da raiz do projeto. Valores esperados para o backend incluem:

```env
DATABASE_URL=postgresql+psycopg2://usuario:senha@db:5432/onboarding_db
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_MAX_SIZE_MB=10
```

Nunca versionar arquivos `.env` com credenciais reais.

## Banco PostgreSQL no Supabase

O backend usa o Supabase apenas como PostgreSQL remoto. A aplicação continua usando SQLAlchemy, e as migrações continuam sendo executadas pelo Alembic. Não é necessário usar `supabase-js`, Supabase Auth, service role key ou anon key para este fluxo.

A `DATABASE_URL` é carregada em `app/core/config.py` a partir do arquivo `.env` da raiz do projeto. A mesma variável é usada pela aplicação em `app/db/session.py` e pelo Alembic em `alembic/env.py`.

Para usar o PostgreSQL do Supabase, copie o exemplo e edite o `.env`:

```bash
cp ../.env.example ../.env
```

No `.env`, defina a `DATABASE_URL` em uma única linha, usando a connection string PostgreSQL do Supabase e mantendo SSL explícito:

```env
DATABASE_URL=postgresql+psycopg2://USUARIO:SENHA@HOST:PORT/postgres?sslmode=require
```

Se a senha tiver caracteres especiais, use a versão URL-encoded da senha.

Para testar a conexão sem alterar o banco:

```bash
cd backend
python -c "from app.db.session import engine; print(engine.connect().exec_driver_sql('select 1').scalar())"
```

O resultado esperado é:

```text
1
```

Para aplicar as migrações no banco do Supabase:

```bash
cd backend
alembic upgrade head
```

Antes de rodar esse comando, confira se o `.env` aponta para o projeto correto do Supabase, pois o Alembic vai alterar o schema desse banco.

Para voltar ao banco local pelo Docker Compose, altere a `DATABASE_URL` no `.env` para o serviço `db`, sem `sslmode=require`:

```env
DATABASE_URL=postgresql+psycopg2://onboarding_user:SENHA_LOCAL@db:5432/onboarding_db
```

Para usar o PostgreSQL local a partir de comandos executados fora do Docker, use `localhost`:

```env
DATABASE_URL=postgresql+psycopg2://onboarding_user:SENHA_LOCAL@localhost:5432/onboarding_db
```

## Como Executar Localmente

O fluxo recomendado para desenvolvimento é subir a API junto com o PostgreSQL pelo Docker Compose, a partir da raiz do projeto:

```bash
cp .env.example .env
docker compose up -d --build
```

Antes de subir os containers, edite o `.env` e troque os valores marcados como `change-me`.

A API ficará disponível em:

- `http://localhost:8001`
- `http://localhost:8001/docs`
- `http://localhost:8001/redoc`
- `http://localhost:8001/health`

## Autenticação Inicial

Como o cadastro de usuários deve ser feito pelo RH, o primeiro usuário RH precisa ser criado por script no ambiente local:

```bash
docker compose exec backend python -m app.scripts.create_initial_rh \
  --email rh@example.com \
  --senha change-me \
  --matricula 1001 \
  --cargo "Analista de RH"
```

Depois disso, o RH pode autenticar e criar colaboradores ou outros usuários de RH pelas rotas protegidas.

Rotas iniciais:

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/register-request`
- `POST /usuarios/colaboradores`
- `POST /usuarios/rh`
- `GET /usuarios/solicitacoes-cadastro`
- `POST /usuarios/solicitacoes-cadastro/{id}/aprovar`
- `POST /usuarios/solicitacoes-cadastro/{id}/recusar`

O cadastro publico cria uma solicitacao pendente. Apenas usuarios de RH podem aprovar ou recusar. Quando o RH aprova, o backend cria o colaborador, gera uma senha temporaria e envia as credenciais por SMTP. Se SMTP nao estiver configurado, o email e registrado no log do backend para desenvolvimento local.

Também é possível executar a API diretamente na máquina para desenvolvimento local:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Ao executar diretamente na máquina, ajuste o `DATABASE_URL` conforme o host do banco utilizado. A documentação automática do FastAPI ficará disponível em:

- `http://localhost:8001/docs`
- `http://localhost:8001/redoc`

## Testes

Os testes devem cobrir principalmente:

- Autenticação e geração de token.
- Permissões por perfil.
- Upload e validação de documentos.
- Regras de status dos documentos.
- Registro de auditoria.

Com `pytest`, o comando esperado será:

```bash
pytest
```

## Padrões de Desenvolvimento

- Separar rotas, schemas, modelos e serviços.
- Não colocar regra de negócio diretamente nas rotas.
- Validar dados de entrada com Pydantic.
- Usar migrações para mudanças no banco de dados.
- Registrar ações sensíveis em logs de auditoria.
- Manter endpoints protegidos por autenticação quando necessário.

## Principais Entidades

- `User`: usuários do sistema, com perfil `employee` ou `hr`.
- `Document`: documentos enviados pelos colaboradores.
- `DocumentStatus`: status do documento, como `pending`, `approved` ou `rejected`.
- `AuditLog`: eventos importantes para rastreabilidade.

## Referências

- Documentação geral do projeto: [`../README.md`](../README.md)
- Arquitetura: [`../docs/arquitetura.md`](../docs/arquitetura.md)
- Requisitos: [`../docs/requisitos.md`](../docs/requisitos.md)
- MVP: [`../docs/mvp.md`](../docs/mvp.md)
