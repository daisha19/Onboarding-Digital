# Padrões de Desenvolvimento

Esta página define os padrões usados pela equipe para manter organização, rastreabilidade e qualidade durante o desenvolvimento.

## Branches

| Branch | Uso |
|---|---|
| `main` | Versões estáveis e entregas consolidadas. |
| `develop` | Integração das funcionalidades em desenvolvimento, quando utilizada pela equipe. |
| `feature/*` | Novas funcionalidades. |
| `fix/*` | Correções de bugs. |
| `docs/*` | Alterações de documentação. |
| `refactor/*` | Refatorações sem mudança de comportamento esperado. |

Exemplos:

```bash
git checkout -b feature/upload-documentos
git checkout -b fix/validacao-jwt
git checkout -b docs/atualiza-readme
```

## Commits

O projeto utiliza uma convenção inspirada em Conventional Commits.

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat: create document upload flow` |
| `fix` | Correção de bug | `fix: validate expired jwt token` |
| `docs` | Documentação | `docs: update development standards` |
| `style` | Ajustes visuais ou formatação sem alterar regra de negócio | `style: improve login page spacing` |
| `refactor` | Refatoração sem mudança funcional | `refactor: reorganize auth services` |
| `test` | Testes | `test: add document upload tests` |
| `chore` | Tarefas de manutenção | `chore: update docker compose config` |

### Boas práticas de commit

- Escrever mensagens em inglês ou português de forma consistente dentro da issue/branch.
- Usar verbo no imperativo ou descrição objetiva.
- Fazer commits pequenos e relacionados a uma única intenção.
- Evitar commits genéricos como `update`, `fix bug` ou `changes`.

## Pull Requests

Antes de abrir um PR:

- Verifique se a branch está atualizada.
- Descreva claramente o que foi alterado.
- Relacione a issue ou requisito correspondente, quando existir.
- Inclua prints ou evidências quando a alteração for visual.
- Informe testes executados ou limitações conhecidas.

Modelo recomendado:

```markdown
## O que foi feito
- 

## Como testar
- 

## Evidências
- 

## Observações
- 
```

## Revisão de Código

Durante a revisão, observar:

- Clareza da implementação.
- Coerência com a arquitetura.
- Tratamento de erros.
- Segurança no acesso a dados.
- Validações no frontend e backend.
- Impacto em documentação e testes.

## Padrões de Qualidade

- Código legível e com nomes descritivos.
- Separação entre componentes, serviços e regras de negócio.
- Validação de entradas em fluxos sensíveis.
- Ausência de credenciais versionadas.
- Documentação atualizada quando houver mudança de comportamento.

## Segurança

Cuidados mínimos:

- Nunca versionar arquivos `.env` reais.
- Usar `.env.example` para documentar variáveis necessárias.
- Proteger endpoints por autenticação e autorização.
- Garantir isolamento de documentos por usuário.
- Registrar ações críticas para auditoria.

## Deploy da Documentação

A documentação é publicada automaticamente no GitHub Pages por meio do GitHub Actions.

O workflow está em:

```text
.github/workflows/docs.yml
```

Ele é executado quando houver push na branch `main` alterando:

- `docs/**`
- `mkdocs.yml`
- `requirements-docs.txt`
- `.github/workflows/docs.yml`

Também é possível executar manualmente pela aba **Actions** do GitHub usando `workflow_dispatch`.

### Configuração necessária no GitHub

No repositório, acesse:

```text
Settings > Pages > Build and deployment
```

Depois selecione:

```text
Source: GitHub Actions
```

Com isso, cada alteração de documentação enviada para a `main` gera e publica uma nova versão do site.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 27/05/2026 | 1.0 | Guilherme Negreiros Pereira | Definindo os padrões de desenvolvimento |
