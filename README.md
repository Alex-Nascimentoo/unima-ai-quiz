# Quiz Maker

Uma plataforma onde o professor pode criar seus quizes e permitir que os alunos pratiquem sua matéria a qualquer momento e com correção automática.  
Demo no YouTube: [Clique aqui.](https://youtu.be/eVyt_kJdT7I)

### Requisitos
- Node >= 20
- Banco de dados Postgres
- Conta de email para envio do código de login

### Instalação
1. Clone o repositório:
   - `git clone <url-do-repo>`
2. Instale as dependências:
   - `npm install`
3. Configure variáveis de ambiente conforme necessário (veja `Configuração`).

### Uso
- Como rodar o projeto localmente (1–2 comandos).
  - Exemplo: `npm start` ou `python main.py`
- Passos básicos para testar a funcionalidade principal (ex.: abrir `http://localhost:3000`).

### Configuração
Defina algumas variáveis importantes no seu arquivo `.env`:
  - `DATABASE_URL` — string de conexão com o banco de dados PostgresSQL
  - `EXPIRE_TIME` — tempo que o usuário ficará logado na sessão do navegador
  - `SESSION_SECRET` — segredo para criptografia do token JWT da sessão
  - `NEXT_PUBLIC_APP_URL` — URL base da aplicação
  - `SMTP_SERVER_HOST` — domínio do servidor de email que será utilizado para enviar o código de login
  - `SMTP_SERVER_USERNAME` — usuário de email
  - `SMTP_SERVER_PASSWORD` — senha do usuário do email
  - `SITE_MAIL_RECIEVER` — usuário de email para receber mensagens em caso de erros de envio de email

## Como funciona (visão geral)

- Componentes
  - Frontend (Next.JS): interface com funções serverless para comunicação com o banco de dados.
  - Armazenamento (PostgresSQL): banco de dados para persistência.

- Fluxo de dados
  1. O usuário executa uma ação na interface.
  3. A função serverless valida os dados, executa a lógica necessária e acessa o armazenamento.
  4. A função serverless retorna uma resposta para exibição na interface ou para o cliente consumir.
