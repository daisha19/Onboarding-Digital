# Stacks Utilizadas

Esta página registra a stack principal do projeto e o papel de cada tecnologia dentro da solução.

## Visão Geral

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Banco de dados | PostgreSQL |
| Infraestrutura | Docker, Docker Compose |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |
| Documentação | Markdown, GitHub Pages |

## Frontend

| Tecnologia | Finalidade |
|---|---|
| Next.js | Framework React para construção da interface web, organização de rotas e estruturação do frontend. |
| TypeScript | Tipagem estática para reduzir erros, melhorar manutenção e documentar contratos entre componentes. |
| Tailwind CSS | Estilização utilitária para construir telas consistentes, responsivas e com baixo acoplamento visual. |

### Responsabilidades do Frontend

- Implementar os fluxos de colaborador e RH.
- Consumir a API do backend.
- Validar entradas antes do envio.
- Exibir status de documentos e feedbacks de erro ou sucesso.
- Garantir uma experiência responsiva em navegadores modernos.

## Backend

| Tecnologia | Finalidade |
|---|---|
| Python | Linguagem principal da API e das regras de negócio. |
| FastAPI | Framework web para construção de endpoints, documentação automática e validação de dados. |
| SQLAlchemy | Camada de ORM para modelagem e comunicação com o banco de dados. |
| Alembic | Controle de migrações para versionar alterações no schema do banco. |

### Responsabilidades do Backend

- Autenticar usuários.
- Aplicar regras de permissão por perfil.
- Gerenciar documentos e metadados.
- Registrar eventos de auditoria.
- Integrar persistência, armazenamento e serviços externos quando necessário.

## Banco de Dados

| Tecnologia | Finalidade |
|---|---|
| PostgreSQL | Banco relacional usado para armazenar usuários, documentos, status, metadados e registros de auditoria. |

O banco deve preservar a integridade dos dados, permitir consultas confiáveis para o RH e manter separação adequada entre informações de usuários.

## Infraestrutura

| Tecnologia | Finalidade |
|---|---|
| Docker | Empacotamento dos serviços em containers reproduzíveis. |
| Docker Compose | Orquestração local dos serviços necessários para desenvolvimento e testes. |

## Cloud

| Tecnologia | Finalidade |
|---|---|
| Google Cloud Platform | Ambiente de nuvem previsto para hospedagem, armazenamento e recursos gerenciados do projeto. |

## CI/CD

| Tecnologia | Finalidade |
|---|---|
| GitHub Actions | Automação de validações, builds e possíveis fluxos de deploy. |

## Documentação

| Tecnologia | Finalidade |
|---|---|
| Markdown | Escrita da documentação do projeto em arquivos versionados. |
| GitHub Pages | Publicação da documentação como site estático. |

## Critérios de Escolha

A stack foi escolhida priorizando:

- Separação clara entre interface, API, banco e infraestrutura.
- Facilidade de desenvolvimento colaborativo.
- Boa documentação e adoção pela comunidade.
- Compatibilidade com deploy em nuvem.
- Suporte a segurança, auditoria e evolução incremental do produto.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 24/05/2026 | 1.0 | Raissa Silva de Oliveira | Definção Inicial das stacks utilizadas |
| 27/05/2026 | 1.1 | Guilherme Negreiros Pereira | Atualizando stacks do frontend |
