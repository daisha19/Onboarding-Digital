# Histórias de Usuário

As histórias de usuário descrevem as necessidades principais dos perfis do OnBoarding Digital e ajudam a orientar o planejamento das issues, critérios de aceite e validação do MVP.

## Colaborador

| ID | História | Prioridade | Critérios de Aceite |
|---|---|---|---|
| HU01 | Como colaborador, quero acessar o sistema com e-mail e senha para acompanhar meu processo de admissão. | Alta | O colaborador consegue autenticar-se e acessar apenas a área correspondente ao seu perfil. |
| HU02 | Como colaborador, quero enviar documentos admissionais para concluir as etapas solicitadas pelo RH. | Alta | O upload exige autenticação, aceita apenas formatos permitidos e associa o documento ao usuário logado. |
| HU03 | Como colaborador, quero visualizar os documentos que enviei para conferir o andamento da minha admissão. | Alta | A listagem mostra apenas documentos vinculados ao próprio colaborador. |
| HU04 | Como colaborador, quero acompanhar o status dos documentos para saber se foram aprovados, rejeitados ou se preciso reenviar. | Alta | Cada documento apresenta status claro e atualizado. |
| HU05 | Como colaborador, quero receber orientação quando um documento for rejeitado para corrigir o envio. | Média | Rejeições possuem justificativa ou orientação registrada pelo RH. |

## Recursos Humanos

| ID | História | Prioridade | Critérios de Aceite |
|---|---|---|---|
| HU06 | Como RH, quero cadastrar colaboradores para iniciar o processo admissional no sistema. | Alta | Apenas usuários RH autenticados conseguem criar colaboradores. |
| HU07 | Como RH, quero listar documentos enviados pelos colaboradores para acompanhar pendências e aprovações. | Alta | O RH visualiza os documentos enviados e consegue filtrar informações relevantes. |
| HU08 | Como RH, quero aprovar documentos válidos para avançar o processo de admissão. | Alta | A alteração de status fica persistida e associada ao documento. |
| HU09 | Como RH, quero rejeitar ou solicitar reenvio de documentos inválidos para manter o processo correto. | Alta | A rejeição exige registro de justificativa ou observação. |
| HU10 | Como RH, quero cadastrar outros usuários RH quando necessário para distribuir a operação do sistema. | Média | Apenas RH autenticado consegue criar outro RH; o primeiro RH é criado por script administrativo. |

## Sistema e Auditoria

| ID | História | Prioridade | Critérios de Aceite |
|---|---|---|---|
| HU11 | Como sistema, quero registrar metadados dos documentos para manter rastreabilidade dos envios. | Alta | Cada documento registra nome, tipo, status, data de envio e usuário associado. |
| HU12 | Como sistema, quero impedir que um colaborador acesse documentos de outro para proteger dados pessoais. | Alta | Requisições fora do escopo do usuário autenticado são bloqueadas. |
| HU13 | Como auditoria, quero registrar ações sensíveis para permitir consulta posterior do histórico. | Média | Login, upload, download, validação e tentativas inválidas devem gerar eventos quando o módulo estiver implementado. |

## Observações

- As histórias de maior prioridade estão diretamente ligadas ao MVP.
- Histórias de prioridade média podem ser refinadas conforme avanço das semanas 10 a 12.
- Os critérios de aceite devem ser usados como referência para abertura e fechamento das issues.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 10/06/2026 | 1.0 | Raissa Silva de Oliveira | Criação das histórias de usuário do MVP |
