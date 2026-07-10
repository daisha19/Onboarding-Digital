# syntax=docker/dockerfile:1

# ---- deps: instala dependencias a partir do lockfile ----
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: valida lint/testes e gera o build de producao (standalone) ----
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* e' inlinado no bundle no momento do build, nao em runtime.
# Para apontar para outro backend, refazer o build com:
#   docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://sua-api ./frontend
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run lint
RUN npm run test
RUN npm run build

# ---- runtime: imagem final, standalone, usuario nao-root ----
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system nodejs \
    && useradd --system --gid nodejs --shell /usr/sbin/nologin nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=8080
# O Docker injeta HOSTNAME=<id do container> por padrao, e o server.js do output
# standalone usa HOSTNAME (se definida) para bindar o socket. Sem isso, o servidor
# escuta so no IP interno do container, e um healthcheck via 127.0.0.1 falha.
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 8080) + '/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# server.js (gerado pelo output standalone) ja respeita a variavel PORT.
CMD ["node", "server.js"]
