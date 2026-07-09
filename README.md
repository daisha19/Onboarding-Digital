# OnBoarding Digital

Sistema web para onboarding digital de colaboradores, criado para apoiar equipes de RH no recebimento, gerenciamento e auditoria de documentos admissionais em um ambiente seguro e centralizado.

Projeto desenvolvido no projeto de extensão AILAB Makers — UnB FCTE.

---

## Sobre o Projeto

O **OnBoarding Digital** digitaliza o fluxo de admissão de novos colaboradores, substituindo processos manuais baseados em e-mails, planilhas e documentos dispersos.

A aplicação permite que colaboradores enviem documentos admissionais com segurança, enquanto o RH acompanha uploads, valida informações e consulta registros de auditoria.

## Documentação

A documentação detalhada do projeto será mantida no GitHub Pages:

- **Docs:** [OnBoarding Digital Docs](https://daisha19.github.io/Onboarding-Digital/)

> Este README tem como objetivo apresentar o projeto de forma sucinta. Detalhes de requisitos, planejamento, arquitetura, reuniões e evolução do produto ficam concentrados na documentação.

## Tecnologias

| Área | Tecnologias |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Banco | PostgreSQL |
| Infraestrutura | Docker, Docker Compose |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |
| Docs | Markdown, GitHub Pages |

## Funcionalidades Principais

- Cadastro e autenticação de usuários
- Controle de acesso por perfil (`employee` e `hr`)
- Upload e visualização segura de documentos admissionais
- Gerenciamento de documentos pelo RH
- Registro de logs de auditoria
- Armazenamento seguro em nuvem

## Fluxo de Desenvolvimento

O desenvolvimento deve ocorrer em branches específicas para cada funcionalidade ou correção. A branch `main` é reservada para versões estáveis do projeto.

Exemplos de commits utilizados:

```bash
feat: create login page
fix: validate jwt token
docs: update README
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

## Como executar o projeto com Docker

Na raiz do projeto, crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Depois, edite o `.env` e troque os valores marcados como `change-me`, principalmente:

- `POSTGRES_PASSWORD`
- a senha dentro de `DATABASE_URL`
- `SECRET_KEY`

Com o `.env` configurado, suba o banco e a API:

```bash
docker compose up -d --build
```

Verifique os containers:

```bash
docker compose ps
```

A API ficará disponível em:

- `http://localhost:8001`
- `http://localhost:8001/docs`
- `http://localhost:8001/health`

Para parar os serviços:

```bash
docker compose down
```

## Google Cloud Storage para documentos

O projeto esta preparado para salvar documentos em disco local durante o
desenvolvimento e no Google Cloud Storage quando a integracao estiver ativa.

No `.env`, o modo local fica assim:

```env
DOCUMENT_STORAGE_BACKEND=local
LOCAL_UPLOAD_DIR=uploads
```

Para usar Google Cloud Storage, crie um bucket privado, crie uma conta de servico
para o backend e conceda permissao de escrita no bucket, como `Storage Object User`.
Depois configure:

```env
DOCUMENT_STORAGE_BACKEND=gcs
GCS_BUCKET_NAME=nome-do-bucket
GCS_UPLOAD_PREFIX=documentos
```

Se estiver rodando localmente com uma chave JSON da conta de servico, configure
tambem:

```env
GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\para\service-account.json
```

Nao coloque chaves JSON ou credenciais reais no repositorio. Em producao, prefira
usar a conta de servico do ambiente onde o backend estiver rodando.

## Build e execução das imagens de produção

Os `Dockerfile` do `backend/` e do `frontend/` têm um estágio de produção
(`runtime`), separado do fluxo de desenvolvimento usado pelo `docker-compose.yml`.
Esses são os artefatos que sobem no Cloud Run.

Cada imagem é multi-stage e **valida lint, testes e build dentro do próprio
`docker build`**: se `pytest` (backend) ou `npm run lint`/`npm run test`/`npm run build`
(frontend) falharem, o build para e a imagem não é gerada.

### Subir tudo localmente em modo produção (recomendado)

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8001` (`/docs`, `/health`)

O `docker-compose.prod.yml` usa `name: onboarding-digital-prod`, então roda em
paralelo ao `docker-compose.yml` de desenvolvimento sem conflitar (redes, volumes
e nomes de projeto são isolados). As únicas portas que podem colidir são as
publicadas no host — ajuste se necessário:

```bash
BACKEND_HOST_PORT=8011 FRONTEND_HOST_PORT=3011 NEXT_PUBLIC_API_BASE_URL=http://localhost:8011 \
  docker compose -f docker-compose.prod.yml up -d --build
```

Para derrubar:

```bash
docker compose -f docker-compose.prod.yml down
```

### Build e execução manual de cada imagem

Backend (escuta na variável `PORT`, `8080` por padrão, sem `--reload`, roda como
usuário não-root):

```bash
docker build -t onboarding-backend ./backend
docker run --rm -p 8080:8080 \
  -e DATABASE_URL=postgresql+psycopg2://usuario:senha@host:5432/onboarding_db \
  -e SECRET_KEY=troque-por-uma-chave-forte \
  onboarding-backend
```

Frontend — atenção: `NEXT_PUBLIC_API_BASE_URL` é **compilado dentro do bundle
JavaScript no momento do `docker build`**, não é lido em runtime. Para apontar
para outra API é preciso *refazer o build* com um novo `--build-arg`:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://sua-api-no-cloud-run \
  -t onboarding-frontend ./frontend

docker run --rm -p 8080:8080 onboarding-frontend
```

### Health checks

Cada imagem tem um `HEALTHCHECK` nativo do Docker, além dos endpoints usados
por load balancers / Cloud Run:

| Serviço | Endpoint |
|---|---|
| Backend | `GET /health` (e `/health/db`, que também valida a conexão com o Postgres) |
| Frontend | `GET /api/health` |
| Banco | `pg_isready` (usado no `healthcheck` do serviço `db` no compose) |

### Notas para o deploy no Cloud Run

- O backend lê a porta de `$PORT` (Cloud Run injeta essa variável automaticamente).
  Localmente, sem `$PORT` definida, o padrão é `8080`.
- O frontend (`server.js` gerado pelo `output: "standalone"` do Next.js) também
  respeita `$PORT`. O Dockerfile fixa `HOSTNAME=0.0.0.0` explicitamente — sem
  isso, o servidor herda o `HOSTNAME` que o Docker injeta por padrão (o ID do
  container) e escuta só nesse endereço interno, o que quebra health checks
  feitos via `127.0.0.1`/`localhost`.
- Nenhuma das imagens roda como root.
- As migrations (`alembic upgrade head`) não rodam automaticamente no start do
  container — isso é intencional, para evitar corridas quando há múltiplas
  instâncias subindo ao mesmo tempo. Rode manualmente antes do deploy (ou como
  um step separado no pipeline de CI/CD).

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
## Equipe

<div align="center">
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/daisha19.png" width="120" style="border-radius:50%;" alt="Raissa Oliveira" /><br>
      <b>Raissa Silva de Oliveira</b><br>
      DevOps / Organização / Liderança
    </td>
    <td align="center">
      <img src="https://github.com/guin409.png" width="120" style="border-radius:50%;" alt="Guilherme Negreiros" /><br>
      <b>Guilherme Negreiros Pereira</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_NINA.png" width="120" style="border-radius:50%;" alt="Nina Amorim" /><br>
      <b>Nina Rosa Alves Amorim</b><br>
      Desenvolvimento
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_EDUARDO.png" width="120" style="border-radius:50%;" alt="Eduardo Pizzol" /><br>
      <b>Eduardo Jesus Dal Pizzol</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_MATHEUS.png" width="120" style="border-radius:50%;" alt="Matheus Rezende" /><br>
      <b>Matheus Eiki Kimura Rezende</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_THOMAZ.png" width="120" style="border-radius:50%;" alt="Thomaz Martins" /><br>
      <b>Thomaz Marra Martins</b><br>
      Desenvolvimento
    </td>
  </tr>
</table>
</div>

## Licença

Projeto desenvolvido no projeto de extensão AILAB Makers — UnB FCTE.
