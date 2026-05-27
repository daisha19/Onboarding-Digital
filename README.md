# OnBoarding Digital

Sistema web para onboarding digital de colaboradores, criado para apoiar equipes de RH no recebimento, gerenciamento e auditoria de documentos admissionais em um ambiente seguro e centralizado.

Projeto desenvolvido no projeto de extensão **AILAB Makers - UnB FCTE**.

---

## Sobre o Projeto

O **OnBoarding Digital** digitaliza o fluxo de admissão de novos colaboradores, substituindo processos manuais baseados em e-mails, planilhas e documentos dispersos.

A aplicação permite que colaboradores enviem documentos admissionais com segurança, enquanto o RH acompanha uploads, valida informações e consulta registros de auditoria.

## Documentação

A documentação detalhada do projeto será mantida no GitHub Pages:

- **Docs:** [OnBoarding Digital Docs](https://daisha19.github.io/Onboarding-Digital/)
- **Documentação no repositório:** [`docs/`](docs/)

> Este README tem como objetivo apresentar o projeto de forma sucinta. Detalhes de requisitos, planejamento, arquitetura, reuniões e evolução do produto ficam concentrados na documentação.

## Tecnologias

| Área | Tecnologias |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Banco | PostgreSQL |
| Infraestrutura | Docker, Docker Compose |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |
| Docs | Markdown, GitHub Pages |

## Funcionalidades Principais

- Cadastro e autenticação de usuários
- Controle de acesso por perfil (`employee` e `hr`)
- Upload e visualização segura de documentos admissionais
- Gerenciamento de documentos pelo RH
- Registro de logs de auditoria
- Armazenamento seguro em nuvem

## Fluxo de Desenvolvimento

O desenvolvimento deve ocorrer em branches específicas para cada funcionalidade ou correção. A branch `main` é reservada para versões estáveis do projeto.

Exemplos de commits utilizados:

```bash
feat: create login page
fix: validate jwt token
docs: update README
refactor: reorganize backend structure
```

## Equipe

<div align="center">
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/daisha19.png" width="120" style="border-radius:50%;" alt="Raissa Oliveira" /><br>
      <b>Raissa Silva de Oliveira</b><br>
      DevOps / Organização / Liderança
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_GUILHERME.png" width="120" style="border-radius:50%;" alt="Guilherme Negreiros" /><br>
      <b>Guilherme Negreiros Pereira</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_NINA.png" width="120" style="border-radius:50%;" alt="Nina Amorim" /><br>
      <b>Nina Rosa Alves Amorim</b><br>
      Desenvolvimento
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_EDUARDO.png" width="120" style="border-radius:50%;" alt="Eduardo Pizzol" /><br>
      <b>Eduardo Jesus Dal Pizzol</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_MATHEUS.png" width="120" style="border-radius:50%;" alt="Matheus Rezende" /><br>
      <b>Matheus Eiki Kimura Rezende</b><br>
      Desenvolvimento
    </td>
    <td align="center">
      <img src="https://github.com/USUARIO_GITHUB_THOMAZ.png" width="120" style="border-radius:50%;" alt="Thomaz Martins" /><br>
      <b>Thomaz Marra Martins</b><br>
      Desenvolvimento
    </td>
  </tr>
</table>
</div>

## Licença

Projeto acadêmico desenvolvido para fins educacionais.
