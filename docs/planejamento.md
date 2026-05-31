# Planejamento

O planejamento organiza a evolução do projeto em frentes de trabalho. As etapas podem ser ajustadas conforme validação do MVP, disponibilidade da equipe e decisões técnicas.

## Frentes de Trabalho

| Frente | Objetivo |
|---|---|
| Produto | Definir escopo, requisitos, MVP e critérios de aceitação. |
| Frontend | Construir as telas e fluxos de usuário em Next.js. |
| Backend | Implementar API, autenticação, regras de negócio e persistência. |
| Banco de Dados | Modelar entidades e garantir integridade dos dados. |
| Infraestrutura | Padronizar execução local com Docker e preparar deploy. |
| Documentação | Manter GitHub Pages atualizado com decisões e guias do projeto. |

## Ciclo de Desenvolvimento

1. Definição da tarefa ou requisito.
2. Criação de branch específica.
3. Implementação com commits pequenos.
4. Atualização de documentação quando necessário.
5. Abertura de pull request.
6. Revisão pela equipe.
7. Merge na branch definida pelo fluxo do projeto.

## Marcos Sugeridos

| Marco | Entrega |
|---|---|
| M1 | Estrutura inicial do repositório, documentação e ambiente local. |
| M2 | Autenticação, perfis de usuário e base da API. |
| M3 | Upload, listagem e persistência de documentos. |
| M4 | Painel de RH, aprovação, rejeição e reenvio. |
| M5 | Auditoria, ajustes de segurança e validações. |
| M6 | Deploy, revisão final e documentação consolidada. |

## Definition of Done

Uma tarefa só deve ser considerada concluída quando:

- O comportamento implementado atende ao requisito relacionado.
- O código foi revisado ou está pronto para revisão.
- Não há credenciais ou arquivos sensíveis versionados.
- A documentação foi atualizada quando a mudança impacta uso, arquitetura ou processo.
- A aplicação continua executável no ambiente esperado.

## Riscos e Cuidados

| Risco | Mitigação |
|---|---|
| Escopo crescer além do MVP | Priorizar requisitos de alta prioridade e registrar melhorias futuras. |
| Falhas de segurança em documentos | Aplicar autenticação, autorização e isolamento por usuário. |
| Ambiente local inconsistente | Padronizar execução com Docker e Docker Compose. |
| Documentação ficar desatualizada | Atualizar docs no mesmo fluxo das mudanças relevantes. |
| Dificuldade de integração | Manter contratos claros entre frontend e backend. |

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 27/05/2026 | 1.0 | Guilherme Negreiros Pereira | Definição do planejamento da equipe |
