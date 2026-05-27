# Requisitos de Software

## Requisitos Funcionais
Os requisitos funcionais descrevem as funcionalidades e comportamentos que o sistema de Onboarding Digital deve executar. Eles representam as ações, serviços e operações disponibilizadas aos usuários, garantindo que o sistema atenda às necessidades do processo de cadastro, autenticação e gerenciamento das informações.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Permitir cadastro de usuários com perfil de colaborador | Alta |
| RF02 | Permitir cadastro de usuários com perfil de RH | Alta |
| RF03 | Permitir autenticação utilizando e-mail e senha | Alta |
| RF04 | Armazenar senhas utilizando criptografia bcrypt | Alta |
| RF05 | Gerar token JWT após autenticação válida | Alta |
| RF06 | Impedir acesso ao sistema com credenciais inválidas | Alta |
| RF07 | Permitir upload de documentos admissionais em formato PDF ou imagem | Alta |
| RF08 | Validar tamanho máximo permitido para upload de arquivos | Média |
| RF09 | Permitir visualização apenas dos documentos do usuário autenticado | Alta |
| RF10 | Permitir que usuários do RH visualizem documentos de todos os colaboradores | Alta |
| RF11 | Permitir listagem de documentos enviados pelo colaborador | Média |
| RF12 | Permitir download de documentos armazenados | Média |
| RF13 | Registrar metadados dos documentos enviados (nome, tipo, data e usuário) | Alta |
| RF14 | Registrar logs de login e logout dos usuários | Média |
| RF15 | Registrar logs de upload e download de documentos | Média |
| RF16 | Permitir que o RH aprove documentos enviados | Alta |
| RF17 | Permitir que o RH solicite reenvio de documentos inválidos | Alta |
| RF18 | Exibir status do documento (pendente, aprovado ou rejeitado) | Alta |
| RF19 | Permitir atualização de documentos enviados anteriormente | Média |
| RF20 | Notificar o colaborador sobre alterações no status dos documentos | Baixa |

## Requisitos Não Funcionais

Os requisitos não funcionais definem os critérios de qualidade e restrições do sistema de Onboarding Digital. Eles estão relacionados ao desempenho, segurança, usabilidade, confiabilidade e outros aspectos que garantem o funcionamento adequado e a boa experiência dos usuários durante a utilização da plataforma.

| ID | Requisito | Prioridade |
|---|---|---|
| RNF01 | Os arquivos enviados pelos usuários devem ser armazenados utilizando Google Cloud Storage | Alta |
| RNF02 | O sistema deve utilizar banco de dados PostgreSQL hospedado em ambiente de nuvem | Alta |
| RNF03 | A aplicação deve suportar execução em containers Docker para ambientes de desenvolvimento e produção | Média |
| RNF04 | O sistema deve possuir pipeline CI/CD automatizada utilizando GitHub Actions | Média |
| RNF05 | O sistema deve garantir isolamento de dados entre usuários autenticados | Alta |
| RNF06 | O sistema deve registrar logs auditáveis das principais operações realizadas | Média |
| RNF07 | O sistema deve utilizar comunicação segura via HTTPS | Alta |
| RNF08 | O sistema deve armazenar senhas utilizando criptografia bcrypt | Alta |
| RNF09 | O tempo de resposta das operações principais deve ser inferior a 2 segundos | Média |
| RNF10 | O projeto deve possuir documentação atualizada contendo setup, arquitetura e variáveis de ambiente | Média |
| RNF11 | O sistema deve ser compatível com navegadores modernos (Chrome, Edge e Firefox) | Baixa |
| RNF12 | O sistema deve possuir arquitetura escalável para suportar múltiplos usuários simultaneamente | Baixa |