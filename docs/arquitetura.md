# Arquitetura

O OnBoarding Digital utiliza uma arquitetura web dividida em camadas para manter responsabilidades claras entre interface, regras de negócio, persistência e infraestrutura.

## Visão Geral da Solução

```mermaid
flowchart LR
  U[Usuário] --> F[Frontend Next.js]
  F --> A[API FastAPI]
  A --> D[(PostgreSQL)]
  A --> S[Armazenamento em nuvem]
  A --> L[Logs de auditoria]
  G[GitHub Actions] --> C[Build e validações]
  C --> P[GitHub Pages / Cloud]
```

## Camadas

### Frontend

Responsável por entregar a experiência de uso para colaboradores e equipe de RH.

Principais responsabilidades:

- Telas de cadastro e login.
- Formulários de upload de documentos.
- Visualização de status dos documentos.
- Painel de acompanhamento para RH.
- Comunicação com a API.

### Backend

Responsável por centralizar regras de negócio e segurança.

Principais responsabilidades:

- Autenticação e autorização.
- Controle de acesso por perfil.
- Validação de documentos enviados.
- Persistência de metadados.
- Registro de logs de auditoria.
- Exposição de endpoints para o frontend.

### Banco de Dados

O PostgreSQL armazena dados relacionais do sistema.

Entidades esperadas:

- Usuários.
- Perfis de acesso.
- Documentos.
- Status de validação.
- Metadados de upload.
- Eventos de auditoria.

### Infraestrutura

O projeto utiliza Docker e Docker Compose para padronizar o ambiente local e reduzir divergências entre máquinas de desenvolvimento.

### Cloud e Deploy

A Google Cloud Platform é a base prevista para recursos de nuvem, enquanto o GitHub Actions apoia automações de validação e entrega. A documentação é publicada com Markdown e GitHub Pages.

## Diagrama de Contexto

```mermaid
flowchart LR
  Colaborador[Colaborador] -->|Login e envio de documentos| Sistema[OnBoarding Digital]
  RH[Equipe de RH] -->|Cadastro e validação| Sistema
  Admin[Responsável técnico] -->|Criação do primeiro RH| Sistema

  Sistema --> API[API FastAPI]
  API --> Banco[(PostgreSQL)]
  API --> Storage[Storage de documentos]
  API --> Auditoria[Logs de auditoria]
```

## Diagrama de Containers

```mermaid
flowchart LR
  U[Usuário] --> Web[Frontend Next.js]
  Web -->|HTTP/JSON| API[Backend FastAPI]

  subgraph Backend
    API --> Auth[Módulo de autenticação]
    API --> Usuarios[Serviço de usuários]
    API --> Docs[Serviço de documentos]
    API --> Logs[Serviço de auditoria]
  end

  API --> DB[(PostgreSQL)]
  Docs --> Storage[Armazenamento local ou nuvem]
```

## Fluxo de Autenticação

```mermaid
sequenceDiagram
  participant U as Usuário
  participant F as Frontend
  participant A as API
  participant B as Banco

  U->>F: Informa e-mail e senha
  F->>A: POST /auth/login
  A->>B: Busca usuário
  B-->>A: Retorna usuário e senha com hash
  A-->>F: Retorna token JWT
  F->>A: GET /auth/me
  A-->>F: Retorna perfil do usuário
  F-->>U: Redireciona para painel por perfil
```

## Fluxo de Documentos

```mermaid
flowchart TD
  A[Colaborador autenticado] --> B[Seleciona tipo de documento]
  B --> C[Envia arquivo]
  C --> D[API valida formato e tamanho]
  D --> E[Arquivo armazenado]
  E --> F[Metadados salvos no PostgreSQL]
  F --> G[Documento listado para colaborador]
  F --> H[Documento disponível para RH]
```

## Princípios Técnicos

- **Segurança por perfil:** colaboradores acessam apenas seus próprios documentos; RH acessa documentos sob sua responsabilidade.
- **Rastreabilidade:** ações relevantes devem gerar registros auditáveis.
- **Separação de responsabilidades:** frontend, backend, banco e infraestrutura evoluem com contratos claros.
- **Reprodutibilidade:** o ambiente deve ser executável via containers.
- **Documentação viva:** decisões e padrões ficam versionados junto ao projeto.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 24/05/2026 | 1.0 | Raiss Silva de Oliveira | Estrutura Inicial |
| 27/05/2026 | 1.1 | Guilherme Negreiros Pereira | Atualizando arquitetura escolhida para o projeto |
| 10/06/2026 | 1.2 | Raissa Silva de Oliveira | Detalhamento dos fluxos de autenticação e documentos |
