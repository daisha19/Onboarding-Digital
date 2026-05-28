# Requisitos de Software

Os requisitos abaixo descrevem as funcionalidades, regras de qualidade e restrições esperadas para o OnBoarding Digital.

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Permitir cadastro de usuários com perfil de colaborador. | Alta |
| RF02 | Permitir cadastro de usuários com perfil de RH. | Alta |
| RF03 | Permitir autenticação utilizando e-mail e senha. | Alta |
| RF04 | Armazenar senhas utilizando criptografia segura. | Alta |
| RF05 | Gerar token de autenticação após login válido. | Alta |
| RF06 | Impedir acesso ao sistema com credenciais inválidas. | Alta |
| RF07 | Permitir upload de documentos admissionais em PDF ou imagem. | Alta |
| RF08 | Validar formato e tamanho máximo permitido para upload. | Média |
| RF09 | Permitir que colaboradores visualizem apenas seus próprios documentos. | Alta |
| RF10 | Permitir que usuários de RH visualizem documentos de colaboradores. | Alta |
| RF11 | Permitir listagem de documentos enviados pelo colaborador. | Média |
| RF12 | Permitir download de documentos armazenados. | Média |
| RF13 | Registrar metadados dos documentos enviados. | Alta |
| RF14 | Registrar logs de login e logout dos usuários. | Média |
| RF15 | Registrar logs de upload, download e validação de documentos. | Média |
| RF16 | Permitir que o RH aprove documentos enviados. | Alta |
| RF17 | Permitir que o RH solicite reenvio de documentos inválidos. | Alta |
| RF18 | Exibir status do documento: pendente, aprovado ou rejeitado. | Alta |
| RF19 | Permitir atualização de documentos enviados anteriormente. | Média |
| RF20 | Notificar o colaborador sobre alterações no status dos documentos. | Baixa |

## Requisitos Não Funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RNF01 | O sistema deve usar PostgreSQL como banco de dados relacional. | Alta |
| RNF02 | A aplicação deve suportar execução em containers Docker. | Média |
| RNF03 | O ambiente local deve ser orquestrado com Docker Compose. | Média |
| RNF04 | O projeto deve possuir automações com GitHub Actions. | Média |
| RNF05 | O sistema deve garantir isolamento de dados entre usuários autenticados. | Alta |
| RNF06 | O sistema deve registrar logs auditáveis das principais operações. | Média |
| RNF07 | O sistema deve utilizar comunicação segura em ambiente publicado. | Alta |
| RNF08 | Senhas e credenciais não devem ser armazenadas em texto puro. | Alta |
| RNF09 | Operações principais devem ter tempo de resposta adequado para uso cotidiano. | Média |
| RNF10 | O projeto deve manter documentação atualizada de setup, arquitetura e variáveis de ambiente. | Média |
| RNF11 | A interface deve ser compatível com navegadores modernos. | Baixa |
| RNF12 | A arquitetura deve permitir evolução para múltiplos usuários simultâneos. | Baixa |

## Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | Um colaborador só pode visualizar documentos vinculados ao próprio usuário. |
| RN02 | Apenas usuários com perfil de RH podem aprovar, rejeitar ou solicitar reenvio de documentos. |
| RN03 | Todo documento enviado deve possuir status inicial pendente. |
| RN04 | Documentos rejeitados devem possuir justificativa ou motivo de reenvio. |
| RN05 | Ações sensíveis devem gerar registro de auditoria. |

## Matriz de Prioridade

| Prioridade | Interpretação |
|---|---|
| Alta | Necessária para o funcionamento do MVP. |
| Média | Importante para qualidade, controle ou evolução do produto. |
| Baixa | Pode ser planejada para versões futuras. |

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 27/05/2026 | 1.0 | Raissa Silva de Oliveira |Definição dos Requisitos |
| 27/05/2026 | 1.1 | Guilherme Negreiros Pereira | Atualizando os requisitos |
