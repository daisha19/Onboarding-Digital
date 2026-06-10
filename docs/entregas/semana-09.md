# Entrega - Semana 9

## Foco da Semana

Autenticação e controle de acesso: cadastro, login, hash de senha, sessão/JWT e rotas protegidas.

## Objetivo

Consolidar a base de autenticação do sistema para permitir que usuários acessem a aplicação com segurança e que o backend consiga diferenciar permissões entre RH e colaborador.

## Entregas Realizadas

- Integração da tela de login com o endpoint `POST /auth/login`.
- Geração de token JWT no backend.
- Armazenamento do token no frontend.
- Consulta ao endpoint `GET /auth/me` para identificar usuário autenticado.
- Separação inicial entre painel RH e painel do colaborador.
- Proteção de rotas de cadastro com verificação de perfil RH.
- Hash de senha no backend.
- Padronização de respostas de erro para autenticação e autorização.
- Validação manual dos endpoints de autenticação com evidência interna.

## Issues Relacionadas

| Issue | Tema | Situação |
|---|---|---|
| #8 | Integrar tela de login com backend | Concluída com ajustes pendentes de fluxo |
| #9 | Implementar sessão do usuário | Concluída com ajustes pendentes de rota |
| #10 | Criar tela de usuário autenticado | Concluída parcialmente com dashboards por perfil |
| #11 | Validar endpoints de autenticação existentes | Validada manualmente |
| #12 | Padronizar respostas de erro da API | Concluída |
| #13 | Revisar regras de permissão entre RH e colaborador | Parcialmente concluída |

## Pontos Positivos

- A base de autenticação foi implementada.
- O backend já possui controle inicial de perfil.
- O fluxo de RH cadastrar colaboradores começou a ser integrado.
- O projeto já diferencia painel RH e painel do colaborador.

## Pendências Identificadas

- Padronizar a rota oficial de login no frontend.
- Corrigir redirecionamentos ainda apontando para `/login` quando a rota ativa for outra.
- Ajustar o fluxo público de cadastro, pois `/auth/register` não existe no backend.
- Garantir que issue concluída tenha comentário, evidência ou PR relacionado.

## Critério de Fechamento da Semana

A Semana 9 pode ser considerada funcionalmente encaminhada, mas com pendências de ajuste no fluxo de frontend e rastreabilidade das issues.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 10/06/2026 | 1.0 | Raissa Silva de Oliveira | Registro da entrega da Semana 9 |
