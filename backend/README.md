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
DATABASE_URL=postgresql://usuario:senha@db:5432/onboarding_db
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_MAX_SIZE_MB=10
```

Nunca versionar arquivos `.env` com credenciais reais.

## Como Executar Localmente

O fluxo recomendado para desenvolvimento é subir a API junto com o PostgreSQL pelo Docker Compose, a partir da raiz do projeto:

```bash
cp .env.example .env
docker compose up -d --build
```

Antes de subir os containers, edite o `.env` e troque os valores marcados como `change-me`.

A API ficará disponível em:

- `http://localhost:8000`
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`
- `http://localhost:8000/health`

Também é possível executar a API diretamente na máquina para desenvolvimento local:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Ao executar diretamente na máquina, ajuste o `DATABASE_URL` conforme o host do banco utilizado. A documentação automática do FastAPI ficará disponível em:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

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
