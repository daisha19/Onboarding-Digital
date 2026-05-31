# Operação do Backend

Esta página reúne comandos e cuidados operacionais para executar, validar e evoluir o backend do OnBoarding Digital.

## Ambiente Local

Subir banco e API:

```bash
docker compose up -d --build
```

Verificar containers:

```bash
docker compose ps
```

Ver logs do backend:

```bash
docker compose logs -f backend
```

Parar os serviços:

```bash
docker compose down
```

## Health Checks

API:

```bash
curl http://localhost:8000/health
```

API com banco:

```bash
curl http://localhost:8000/health/db
```

## Migrações

Gerar migration depois de alterar models:

```bash
docker compose exec backend alembic revision --autogenerate -m "descricao da mudanca"
```

Aplicar migrations:

```bash
docker compose exec backend alembic upgrade head
```

Ver versão atual:

```bash
docker compose exec backend alembic current
```

## Seed Inicial de RH

Como o cadastro de usuários é restrito ao RH, o primeiro usuário RH deve ser criado por script:

```bash
docker compose exec backend python -m app.scripts.create_initial_rh \
  --email rh@example.com \
  --senha change-me \
  --matricula 1001 \
  --cargo "Analista de RH"
```

Use valores reais apenas no ambiente local ou em secrets seguros. Não versionar credenciais reais.

## Validações

Compilar os módulos Python:

```bash
docker compose exec backend python -m compileall app
```

Rodar testes:

```bash
docker compose exec backend pytest
```

## CI

O workflow `.github/workflows/backend.yml` valida o backend em pull requests e pushes na `main` quando arquivos do backend mudam.

O fluxo executa:

- instalação das dependências;
- compilação da aplicação;
- aplicação das migrations;
- testes automatizados.

## Variáveis Sensíveis

Nunca versionar valores reais de:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY`
- senhas de usuários seed

O arquivo `.env.example` deve manter apenas placeholders e exemplos.
