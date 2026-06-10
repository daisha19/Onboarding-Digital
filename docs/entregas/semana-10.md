# Planejamento - Semana 10

## Foco da Semana

Upload e listagem: upload funcional, associação com usuário autenticado e listagem filtrada.

## Objetivo

Implementar o fluxo inicial de documentos para que colaboradores autenticados possam enviar arquivos e consultar seus próprios documentos, enquanto usuários RH conseguem acompanhar os envios realizados.

Google Cloud Storage fica previsto para a Semana 11. Na Semana 10, o foco é validar o fluxo funcional e a persistência dos metadados.

## Issues Planejadas

| Issue | Tema | Área | Prioridade |
|---|---|---|---|
| #14 | Criar estrutura de gerenciamento de documentos no backend | Backend | Alta |
| #15 | Implementar upload e armazenamento de documentos | Backend | Alta |
| #16 | Criar listagem filtrada de documentos | Backend | Alta |
| #17 | Criar tela de upload | Frontend | Alta |
| #18 | Criar tela "Meus Documentos" para colaborador | Frontend | Alta |
| #19 | Ajustar dashboard RH para documentos reais | Frontend | Média |
| #20 | Corrigir fluxo de autenticação e rota de login | Frontend | Alta |
| #21 | Corrigir e padronizar fluxos de cadastro de usuários | Frontend / Documentação | Alta |

## Entrega Esperada

Ao final da Semana 10, o sistema deve demonstrar:

- Upload de documento por usuário autenticado.
- Associação do documento ao usuário correto.
- Registro de metadados do documento.
- Listagem de documentos do colaborador.
- Isolamento para impedir que um colaborador veja documentos de outro.
- Visão inicial para RH acompanhar documentos enviados.
- Fluxo de login e cadastro coerente com as regras de acesso.

## Critérios de Aceite

- Usuário sem token não acessa rotas de documentos.
- Colaborador autenticado consegue enviar documento.
- Documento enviado fica associado ao colaborador correto.
- Colaborador visualiza apenas seus próprios documentos.
- RH visualiza documentos de colaboradores.
- Arquivos inválidos ou acima do tamanho permitido são recusados.
- Dados mockados não devem substituir dados reais quando a API já estiver pronta.

## Riscos

| Risco | Mitigação |
|---|---|
| Fluxo de login inconsistente prejudicar testes de upload | Priorizar correção da rota de login antes da integração completa |
| Frontend consumir endpoints ainda incompletos | Definir contrato de request/response entre backend e frontend |
| Escopo avançar para storage em nuvem antes da hora | Manter Google Cloud Storage para Semana 11 |
| Falta de evidência para fechamento das issues | Exigir comentário, PR e validação mínima antes de fechar |

## Checklist de Encerramento

- [ ] Backend possui rotas de upload e listagem.
- [ ] Frontend possui tela de upload.
- [ ] Frontend possui tela "Meus Documentos".
- [ ] RH consegue visualizar documentos enviados.
- [ ] Regras de isolamento foram validadas.
- [ ] Issues possuem evidência mínima antes de fechar.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 10/06/2026 | 1.0 | Raissa Silva de Oliveira | Planejamento inicial da Semana 10 |
