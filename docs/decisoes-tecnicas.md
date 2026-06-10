# Decisões Técnicas

Esta página registra decisões relevantes do projeto. O objetivo é manter rastreabilidade sobre escolhas técnicas e regras que impactam segurança, arquitetura e fluxo de uso.

## ADR 0001 - Backend com FastAPI

**Status:** aceita  
**Data:** 10/06/2026

### Contexto

O projeto precisa de uma API para autenticação, controle de acesso, persistência de usuários, documentos e logs de auditoria.

### Decisão

Utilizar FastAPI como framework backend principal.

### Justificativa

- Boa produtividade para criação de APIs REST.
- Documentação automática via OpenAPI.
- Integração simples com Pydantic e SQLAlchemy.
- Adequado ao escopo do MVP.

### Consequências

- A equipe deve manter rotas, schemas, modelos e serviços separados.
- A documentação automática da API pode apoiar testes e validações.

## ADR 0002 - Autenticação com JWT

**Status:** aceita  
**Data:** 10/06/2026

### Contexto

O sistema precisa autenticar usuários e proteger rotas de acordo com o perfil.

### Decisão

Utilizar JWT para autenticação inicial da aplicação.

### Justificativa

- Permite proteger endpoints como `/auth/me` e rotas de cadastro.
- Facilita integração com frontend.
- Atende ao escopo da Semana 9.

### Consequências

- O frontend deve armazenar e enviar o token nas chamadas protegidas.
- O backend deve validar token ausente, inválido ou expirado.
- Rotas sensíveis devem depender de autenticação e checagem de perfil.

## ADR 0003 - Primeiro RH criado por script administrativo

**Status:** aceita  
**Data:** 10/06/2026

### Contexto

Usuários RH possuem permissões sensíveis, como cadastrar colaboradores e outros usuários RH. Permitir cadastro público de RH criaria risco de acesso indevido.

### Decisão

O primeiro usuário RH deve ser criado por script administrativo. Depois disso, usuários RH autenticados podem cadastrar colaboradores e, se necessário, outros usuários RH por rotas protegidas.

### Justificativa

- Evita autocadastro público de perfil privilegiado.
- Mantém o controle inicial nas mãos da equipe técnica.
- Alinha o frontend com a regra de segurança do backend.

### Consequências

- A tela pública de cadastro não deve criar RH livremente.
- O fluxo de cadastro de colaboradores deve ocorrer no painel RH.
- A documentação de operação deve explicar como criar o primeiro RH.

## ADR 0004 - PostgreSQL como banco relacional

**Status:** aceita  
**Data:** 10/06/2026

### Contexto

O sistema possui entidades relacionais, como usuários, colaboradores, RH, documentos, status e logs de auditoria.

### Decisão

Utilizar PostgreSQL como banco de dados principal.

### Justificativa

- Boa aderência ao modelo relacional do sistema.
- Suporte a integridade referencial.
- Compatível com Docker Compose e Supabase/PostgreSQL remoto.

### Consequências

- Mudanças estruturais devem ser versionadas por migrações.
- A aplicação deve carregar `DATABASE_URL` por variável de ambiente.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 10/06/2026 | 1.0 | Raissa Silva de Oliveira | Registro inicial das decisões técnicas |
