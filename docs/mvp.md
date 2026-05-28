# MVP

O MVP do OnBoarding Digital concentra as funcionalidades essenciais para validar o fluxo de admissão digital entre colaboradores e RH.

## Objetivo

Entregar uma primeira versão funcional capaz de:

- Cadastrar e autenticar usuários.
- Diferenciar permissões entre colaborador e RH.
- Permitir envio de documentos admissionais.
- Permitir que o RH visualize e valide documentos.
- Registrar informações importantes para auditoria.

## Perfis do Sistema

| Perfil | Responsabilidades |
|---|---|
| Colaborador (`employee`) | Enviar documentos, acompanhar status e visualizar apenas seus próprios arquivos. |
| RH (`hr`) | Visualizar documentos de colaboradores, validar envios, solicitar reenvio e acompanhar logs. |

## Escopo do MVP

### Colaborador

- Criar conta.
- Fazer login.
- Enviar documentos em PDF ou imagem.
- Visualizar documentos enviados.
- Acompanhar status: pendente, aprovado ou rejeitado.

### RH

- Fazer login.
- Listar colaboradores e documentos enviados.
- Visualizar ou baixar documentos.
- Aprovar documentos válidos.
- Rejeitar documentos inválidos com justificativa.
- Solicitar reenvio quando necessário.

### Sistema

- Armazenar metadados de documentos.
- Proteger rotas por autenticação.
- Aplicar permissões por perfil.
- Registrar logs de ações relevantes.

## Fora do Escopo Inicial

Funcionalidades que podem evoluir depois do MVP:

- Assinatura digital.
- Integração com sistemas externos de RH.
- Notificações por e-mail ou WhatsApp.
- Dashboard analítico avançado.
- Gestão completa de etapas admissionais.
- Multiempresa ou múltiplas unidades organizacionais.

## Critérios de Aceitação

O MVP será considerado entregue quando:

- Um colaborador conseguir criar conta, autenticar-se e enviar documentos.
- O colaborador não conseguir acessar documentos de outros usuários.
- Um usuário de RH conseguir visualizar documentos enviados.
- O RH conseguir alterar o status de um documento.
- O sistema registrar metadados e eventos principais.
- A aplicação puder ser executada em ambiente local documentado.

## Roadmap Resumido

<div class="od-timeline">
  <p><strong>1. Base do produto:</strong> estrutura do frontend, backend, banco e autenticação.</p>
  <p><strong>2. Fluxo de documentos:</strong> upload, listagem, visualização e status.</p>
  <p><strong>3. Painel de RH:</strong> gestão dos documentos enviados pelos colaboradores.</p>
  <p><strong>4. Auditoria:</strong> registro das principais ações realizadas no sistema.</p>
  <p><strong>5. Deploy e documentação:</strong> publicação, validações e GitHub Pages atualizado.</p>
</div>

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 27/05/2026 | 1.0 | Guilherme Negreiros Pereira | Estrutura e conteúdo do MVP |
