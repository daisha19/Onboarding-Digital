# OnBoarding Digital

<section class="od-hero">
  <div>
    <h1>Onboarding admissional mais seguro, organizado e auditável.</h1>
    <p>
      Plataforma web para centralizar o envio, validação e acompanhamento de documentos admissionais,
      conectando colaboradores e equipes de RH em um fluxo digital simples, rastreável e preparado para nuvem.
    </p>
    <div class="od-actions">
      <a class="od-button primary" href="mvp/">Conhecer o MVP</a>
      <a class="od-button secondary" href="stacks-utilizadas/">Ver stack técnica</a>
    </div>
  </div>

  <div class="od-preview" aria-label="Prévia visual do painel do produto">
    <div class="od-preview-top">
      <span class="od-dot"></span>
      <span class="od-dot"></span>
      <span class="od-dot"></span>
    </div>
    <div class="od-preview-body">
      <div class="od-metric-row">
        <div>
          <strong>Documentos recebidos</strong>
          <span>Envios realizados por colaboradores</span>
        </div>
        <div class="od-status ok">84%</div>
      </div>
      <div class="od-doc-row">
        <div>
          <strong>RG e CPF</strong>
          <span>Maria Oliveira • PDF</span>
        </div>
        <div class="od-status">Em análise</div>
      </div>
      <div class="od-doc-row">
        <div>
          <strong>Comprovante de residência</strong>
          <span>João Santos • Imagem</span>
        </div>
        <div class="od-status warn">Reenvio</div>
      </div>
      <div class="od-doc-row">
        <div>
          <strong>Carteira de trabalho</strong>
          <span>Ana Costa • PDF</span>
        </div>
        <div class="od-status ok">Aprovado</div>
      </div>
    </div>
  </div>
</section>

## Visão Geral

Projeto desenvolvido no projeto de extensão AILAB Makers — UnB FCTE.

O produto substitui etapas manuais baseadas em e-mails, planilhas e arquivos espalhados por um fluxo digital com autenticação, controle de acesso, upload seguro de documentos e registros de auditoria.

<section class="od-section od-grid">
  <article class="od-card">
    <h3>Colaborador</h3>
    <p>Cria conta, acessa a plataforma e envia seus documentos admissionais com acompanhamento do status.</p>
  </article>
  <article class="od-card">
    <h3>Recursos Humanos</h3>
    <p>Consulta documentos enviados, valida informações, solicita reenvios e acompanha o histórico de ações.</p>
  </article>
  <article class="od-card">
    <h3>Auditoria</h3>
    <p>Registra operações importantes para aumentar rastreabilidade, segurança e confiança no processo.</p>
  </article>
</section>

## Principais Entregas

- Autenticação de usuários com perfis de acesso.
- Upload de documentos admissionais em PDF ou imagem.
- Listagem, visualização e download seguro de documentos.
- Aprovação, rejeição e solicitação de reenvio pelo RH.
- Registro de logs para ações relevantes.
- Estrutura preparada para execução com Docker, CI/CD e deploy em cloud.

## Arquitetura em Camadas

<section class="od-section od-grid">
  <article class="od-card">
    <h3>Frontend</h3>
    <p>Interface em Next.js, TypeScript e Tailwind para os fluxos de colaborador e RH.</p>
  </article>
  <article class="od-card">
    <h3>Backend</h3>
    <p>API em FastAPI com regras de negócio, autenticação, controle de documentos e persistência.</p>
  </article>
  <article class="od-card">
    <h3>Infraestrutura</h3>
    <p>Ambiente containerizado com Docker, banco PostgreSQL, GitHub Actions e Google Cloud Platform.</p>
  </article>
</section>

## Stack Resumida

| Área | Tecnologias |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Banco de dados | PostgreSQL |
| Infraestrutura | Docker, Docker Compose |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |
| Documentação | Markdown, GitHub Pages |

## Equipe

<section class="od-team">
  <article class="od-member">
    <img src="https://github.com/daisha19.png" alt="Raissa Silva de Oliveira">
    <div><strong>Raissa Silva de Oliveira</strong><span>DevOps / Organização / Liderança</span></div>
  </article>
  <article class="od-member">
    <img src="https://github.com/guin409.png" alt="Guilherme Negreiros Pereira">
    <div><strong>Guilherme Negreiros Pereira</strong><span>Desenvolvimento</span></div>
  </article>
  <article class="od-member">
    <img src="https://github.com/ninaalves14.png" alt="Nina Rosa Alves Amorim">
    <div><strong>Nina Rosa Alves Amorim</strong><span>Desenvolvimento</span></div>
  </article>
  <article class="od-member">
    <img src="https://github.com/Edupizzol.png" alt="Eduardo Jesus Dal Pizzol">
    <div><strong>Eduardo Jesus Dal Pizzol</strong><span>Desenvolvimento</span></div>
  </article>
  <article class="od-member">
    <img src="https://github.com/mateiki.png" alt="Matheus Eiki Kimura Rezende">
    <div><strong>Matheus Eiki Kimura Rezende</strong><span>Desenvolvimento</span></div>
  </article>
  <article class="od-member">
    <img src="https://github.com/marrathomaz.png" alt="Thomaz Marra Martins">
    <div><strong>Thomaz Marra Martins</strong><span>Desenvolvimento</span></div>
  </article>
</section>

## Navegação Recomendada

- [MVP](mvp.md): escopo da primeira entrega e funcionalidades essenciais.
- [Requisitos](requisitos.md): requisitos funcionais e não funcionais.
- [Arquitetura](arquitetura.md): organização técnica do sistema.
- [Stacks Utilizadas](stacks-utilizadas.md): tecnologias e responsabilidades.
- [Padrões de Desenvolvimento](padroes-desenvolvimento.md): branches, commits e pull requests.

## Histórico de Revisão

| Data | Versão | Autor | Descrição |
|---|---|---|---|
| 24/05/2026 | 1.0 | Raiss Silva de Oliveira | Estrutura inicial do git pages. |
| 27/05/2026 | 1.1 | Guilherme Negreiros Pereira |Atualizando tabela de integrantes. |
