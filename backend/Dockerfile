# syntax=docker/dockerfile:1

# ---- base: dependencias de runtime, sem codigo da aplicacao ----
# Usado tambem pelo docker-compose.yml de desenvolvimento (target: base),
# que monta o codigo via volume e roda com --reload.
FROM python:3.11-slim AS base

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- builder: valida que o codigo compila e a suite de testes passa ----
FROM base AS builder

COPY . .

RUN python -m compileall app
RUN pytest

# ---- runtime: imagem final de producao, sem testes nem arquivos de dev ----
FROM base AS runtime

RUN groupadd --system app \
    && useradd --system --gid app --shell /usr/sbin/nologin app

COPY --from=builder /app/app ./app
COPY --from=builder /app/alembic ./alembic
COPY --from=builder /app/alembic.ini .

RUN mkdir -p uploads && chown -R app:app /app

USER app

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ.get('PORT', '8080') + '/health', timeout=3)" || exit 1

# Respeita a variavel PORT injetada pelo Cloud Run (default 8080 fora dele).
# Sem --reload: processo unico e estavel para producao.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
