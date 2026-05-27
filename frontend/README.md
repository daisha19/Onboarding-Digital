# Frontend

Interface web do projeto **OnBoarding Digital**, responsável pela experiência de colaboradores e equipe de RH durante o processo de envio, acompanhamento e validação de documentos admissionais.

## Objetivo

O frontend deve oferecer uma aplicação clara, responsiva e segura para que colaboradores enviem documentos e acompanhem seus status, enquanto o RH gerencia os documentos recebidos e executa validações.

## Stack Prevista

| Tecnologia | Uso |
|---|---|
| Next.js | Framework React para rotas e estrutura da aplicação |
| TypeScript | Tipagem estática e contratos mais claros |
| Tailwind CSS | Estilização utilitária e responsiva |

## Responsabilidades

- Implementar telas de cadastro e login.
- Consumir a API do backend.
- Armazenar e enviar token de autenticação conforme o padrão definido.
- Separar fluxos de colaborador e RH.
- Permitir upload de documentos em PDF ou imagem.
- Exibir lista de documentos enviados e seus status.
- Exibir painel de RH para visualizar, baixar, aprovar, rejeitar ou solicitar reenvio.
- Mostrar mensagens claras de erro, sucesso e carregamento.

## Estrutura Sugerida

```text
frontend/
├── src/
│   ├── app/            # Rotas do Next.js
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/            # Cliente HTTP, helpers e configurações
│   ├── services/       # Comunicação com a API
│   ├── types/          # Tipos TypeScript compartilhados
│   └── styles/         # Estilos globais, se necessário
├── public/             # Arquivos estáticos
├── package.json        # Scripts e dependências
└── README.md
```

Essa estrutura pode ser adaptada conforme o projeto for implementado.

## Variáveis de Ambiente

As variáveis devem ser documentadas no `.env.example` da raiz do projeto. Valor esperado para o frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Somente variáveis que podem ser expostas ao navegador devem usar o prefixo `NEXT_PUBLIC_`.

## Como Executar Localmente

Quando a aplicação estiver implementada, o fluxo esperado será:

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

Caso o projeto use outro gerenciador de pacotes, como `pnpm` ou `yarn`, atualizar esta seção com os comandos adotados.

## Fluxos Principais

### Colaborador

- Criar conta.
- Fazer login.
- Enviar documentos admissionais.
- Visualizar documentos enviados.
- Acompanhar status: pendente, aprovado ou rejeitado.

### RH

- Fazer login.
- Listar colaboradores e documentos enviados.
- Visualizar ou baixar documentos.
- Aprovar documentos válidos.
- Rejeitar documentos inválidos com justificativa.
- Solicitar reenvio quando necessário.

## Integração com a API

O frontend deve consumir a API do backend usando a URL definida em `NEXT_PUBLIC_API_URL`.

Boas práticas esperadas:

- Centralizar chamadas HTTP em uma camada de serviço.
- Tratar respostas de erro da API.
- Redirecionar usuários não autenticados para login.
- Bloquear telas conforme o perfil do usuário.
- Evitar duplicação de tipos e contratos.

## Testes

Os testes devem priorizar:

- Renderização das telas principais.
- Validação de formulários.
- Fluxo de autenticação.
- Controle de acesso por perfil.
- Upload de documentos.
- Estados de carregamento e erro.

Com a stack definida, documentar aqui os comandos reais de teste, por exemplo:

```bash
npm test
```

## Padrões de Desenvolvimento

- Usar TypeScript em componentes, serviços e tipos compartilhados.
- Criar componentes reutilizáveis para formulários, botões, tabelas e feedbacks.
- Manter regras de autorização refletidas na interface, sem substituir a validação do backend.
- Garantir layout responsivo para navegadores modernos.
- Evitar credenciais, tokens ou dados sensíveis fixos no código.

## Referências

- Documentação geral do projeto: [`../README.md`](../README.md)
- Arquitetura: [`../docs/arquitetura.md`](../docs/arquitetura.md)
- Requisitos: [`../docs/requisitos.md`](../docs/requisitos.md)
- MVP: [`../docs/mvp.md`](../docs/mvp.md)
