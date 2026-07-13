# Testes

Esta página reúne os testes automatizados executados no projeto e as evidências geradas para apoiar a rastreabilidade da qualidade do sistema.

## Resumo da Execução

| Frente | Comando | Resultado | Evidência |
|---|---|---:|---|
| Backend | `pytest` | 47 testes aprovados | [Log do pytest](assets/evidencias-testes/backend-pytest-2026-07-12.txt) |
| Frontend | `npm run test` | 2 testes aprovados | [Log do Vitest](assets/evidencias-testes/frontend-vitest-2026-07-12.txt) |

Execução realizada em `12/07/2026`, em ambiente local de desenvolvimento.

## Ambiente Utilizado

| Item | Versão |
|---|---|
| Sistema operacional | Windows |
| Python | 3.13.3 |
| Node.js | 22.15.0 |
| npm | 10.9.2 |
| Backend test runner | pytest |
| Frontend test runner | Vitest com jsdom |


## Backend

Os testes do backend validam regras da API FastAPI, serviços e fluxos sensíveis do onboarding digital.

### Comando Executado

```bash
cd backend
pytest
```

### Resultado

```text
47 passed, 9 warnings
```

### Cobertura Funcional Verificada

| Arquivo de teste | O que valida |
|---|---|
| `test_health.py` | Endpoints de saúde da API. |
| `test_documentos_routes.py` | Rotas principais de documentos. |
| `test_documentos_download.py` | Download e autorização de acesso a documentos. |
| `test_documentos_status.py` | Fluxos de aprovação, rejeição e status de documentos. |
| `test_registration_requests_routes.py` | Solicitações públicas de cadastro e avaliação pelo RH. |
| `test_rh_dashboard_routes.py` | Dados consumidos pelo dashboard de RH. |
| `test_storage_service.py` | Serviço de armazenamento de arquivos. |
| `test_usuarios_perfil.py` | Perfis de usuário e regras relacionadas. |
| `test_auditoria_integracao.py` | Registro de eventos de auditoria em fluxos integrados. |

### Evidência

O log completo da execução está disponível em:

[assets/evidencias-testes/backend-pytest-2026-07-12.txt](assets/evidencias-testes/backend-pytest-2026-07-12.txt)

## Frontend

Os testes do frontend validam comportamento renderizado em componentes/telas Next.js usando Vitest e jsdom.

### Comando Executado

```bash
cd frontend
npm run test
```

### Resultado

```text
1 test file passed
2 tests passed
```

### Cobertura Funcional Verificada

| Arquivo de teste | O que valida |
|---|---|
| `app/RH_dashboard/page.test.tsx` | Renderização e comportamento esperado da tela de dashboard do RH. |

### Evidência

O log completo da execução está disponível em:

[assets/evidencias-testes/frontend-vitest-2026-07-12.txt](assets/evidencias-testes/frontend-vitest-2026-07-12.txt)

## Testes no CI/CD

O projeto possui workflows no GitHub Actions para validar backend e frontend automaticamente.

### Backend

O workflow do backend executa:

- instalação das dependências Python;
- compilação da aplicação;
- aplicação das migrations;
- execução da suíte `pytest`.

### Frontend

O workflow do frontend executa:

- instalação das dependências com `npm ci`;
- auditoria de dependências;
- lint;
- testes automatizados;
- build da aplicação.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 12/07/2026 | 1.0 | Raissa Oliveira | Inclusão da seção de testes com evidências de execução local. |
