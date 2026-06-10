# Jornadas do Usuário

As jornadas descrevem os caminhos esperados para os principais perfis do OnBoarding Digital. Elas servem como referência para validar fluxos de tela, rotas protegidas, permissões e integração entre frontend e backend.

## Jornada do Colaborador

```mermaid
flowchart LR
  A[Recebe acesso] --> B[Faz login]
  B --> C[Acessa painel do colaborador]
  C --> D[Envia documentos]
  D --> E[Consulta meus documentos]
  E --> F[Acompanha status]
  F --> G{Documento rejeitado?}
  G -->|Sim| H[Reenvia documento corrigido]
  G -->|Não| I[Processo segue para RH]
  H --> F
```

### Etapas

| Etapa | Descrição | Validação Esperada |
|---|---|---|
| Login | Colaborador acessa com e-mail e senha. | Token JWT gerado e perfil identificado. |
| Painel | Sistema direciona para a área de colaborador. | Usuário não RH não acessa área de RH. |
| Upload | Colaborador envia documentos solicitados. | Arquivo e metadados ficam vinculados ao usuário autenticado. |
| Listagem | Colaborador consulta documentos enviados. | Apenas documentos próprios são exibidos. |
| Status | Colaborador acompanha pendências. | Status atualizado aparece na interface. |

## Jornada do RH

```mermaid
flowchart LR
  A[RH inicial criado por script] --> B[RH faz login]
  B --> C[Acessa painel RH]
  C --> D[Cadastra colaborador]
  D --> E[Acompanha documentos]
  E --> F{Documento válido?}
  F -->|Sim| G[Aprova documento]
  F -->|Não| H[Rejeita ou solicita reenvio]
  G --> I[Atualiza status]
  H --> I
```

### Etapas

| Etapa | Descrição | Validação Esperada |
|---|---|---|
| Criação do primeiro RH | Usuário inicial é criado por script administrativo. | Não existe cadastro público livre de RH. |
| Login RH | RH acessa com credenciais válidas. | Perfil retornado como RH. |
| Cadastro de colaborador | RH cria usuários colaboradores. | Rota protegida por `require_rh`. |
| Acompanhamento | RH consulta documentos enviados. | Dados vêm da API e respeitam permissões. |
| Validação | RH aprova, rejeita ou solicita reenvio. | Status e justificativa ficam persistidos. |

## Jornada Técnica de Autenticação

```mermaid
sequenceDiagram
  participant U as Usuário
  participant F as Frontend
  participant A as API FastAPI
  participant B as PostgreSQL

  U->>F: Informa e-mail e senha
  F->>A: POST /auth/login
  A->>B: Consulta usuário e senha com hash
  B-->>A: Dados do usuário
  A-->>F: Token JWT
  F->>A: GET /auth/me com token
  A-->>F: Perfil do usuário
  F-->>U: Redireciona para painel correto
```

## Pontos de Atenção

- O fluxo de login deve usar uma rota padronizada no frontend.
- Usuários sem token devem ser redirecionados para a tela de login correta.
- Colaboradores não devem conseguir acessar rotas ou telas de RH.
- O cadastro público não deve permitir criação indevida de colaboradores ou RH.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 10/06/2026 | 1.0 | Raissa Silva de Oliveira | Criação das jornadas principais |
