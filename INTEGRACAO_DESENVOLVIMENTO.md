# Integração e Guia de Desenvolvimento — Kapa Protetores

Este documento descreve as funcionalidades integradas no monorepo, com foco na autenticação via **Google OAuth**, conexão da interface com a API Express, infraestrutura local com Docker e procedimentos para resolução de problemas comuns de ambiente.

---

## 1. Resumo das Funcionalidades Integradas

### 1.1 Autenticação Google OAuth (`feature/google-auth`)

A autenticação social com o Google foi integrada tanto no cliente (React Native / Expo Web) quanto na API Node.js/Express:

- **Fluxo no Cliente (`apps/mobile-web`)**:
  - Implementado em [`LoginForm`](apps/mobile-web/src/components/forms/login/index.tsx) através do hook `Google.useIdTokenAuthRequest(...)` da biblioteca `expo-auth-session/providers/google`.
  - Configurado com `WebBrowser.maybeCompleteAuthSession()` para captura e fechamento seguro do popup de autenticação em ambiente web e mobile.
  - Extração resiliente de token: prioriza o `id_token` retornado pelo Google, mantendo fallback para `response.authentication?.idToken` e `response.params?.access_token`.
  - Integrado com o [`AuthProvider`](apps/mobile-web/src/contexts/authProvider.tsx) via método `handleGoogleLogin`:
    - Dispara requisição HTTP `POST /api/auth/google` enviando `{ idToken }`.
    - Registra log de debug contendo `{ token, user }`.
    - Mantém a rotina de armazenamento em storage escrita e comentada para etapa posterior de persistência de sessão.
    - Atualiza o estado `isLogged(true)` e redireciona o usuário para `/(protected)/(tabs)`.

- **Fluxo no Backend (`apps/server`)**:
  - Rota dedicada `POST /api/auth/google`.
  - Validação do corpo da requisição via Zod (`googleAuthSchema`).
  - Método [`UserService.authenticateWithGoogle`](apps/server/src/services/UserService.ts) com suporte dual de verificação:
    1. **Google ID Token (JWT)**: Validação criptográfica com as chaves públicas oficiais do Google via `googleClient.verifyIdToken(...)`.
    2. **Google OAuth2 Access Token (`ya29...`)**: Validação de segurança via `googleClient.getTokenInfo(...)` e requisição ao endpoint OIDC `https://www.googleapis.com/oauth2/v3/userinfo`.
  - Validação estrita de audiência (`audience`) contra os Client IDs configurados no projeto (`GOOGLE_CLIENT_ID`, `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`).
  - Verificação obrigatória de email confirmado (`email_verified === true`).
  - **Find or Create**: Localiza o usuário cadastrado pelo email; caso não exista, cria automaticamente a conta com papel `adopter` e permissões padrão (`DEFAULT_USER_ADOPTER_RULES`).
  - **Sincronização de Avatar**: Caso o usuário já exista e sua foto de perfil do Google seja atualizada ou divirja do banco, o avatar é atualizado automaticamente durante o login.
  - Emissão de JWT próprio da aplicação via [`Jwt.generateToken`](apps/server/src/utils/Jwt.ts) contendo `sub`, `email`, `role`, `rules` e `username`.

---

### 1.2 Correções Críticas Realizadas Durante a Integração

1. **Erro HTTP 401 (Token Inválido ou Ausente)**:
   - **Causa**: O hook padrão `Google.useAuthRequest` na web operava em modo de concessão implícita de `access_token` em vez de `id_token`. O backend esperava um JWT de 3 segmentos e falhava ao verificar tokens opacos.
   - **Solução**: Migração para `Google.useIdTokenAuthRequest` no frontend e adição de suporte dual a ID Token e Access Token no `UserService` do backend, além da sincronização dos Client IDs no `.env` do servidor.

2. **Erro HTTP 500 (`P2021 TableDoesNotExist: tb_users`)**:
   - **Causa**: O container Docker do PostgreSQL estava ativo, mas as migrations existentes do Prisma ainda não tinham sido executadas no banco.
   - **Solução**: Execução de `npx prisma migrate deploy` aplicando as migrações `20260910141706_init` e `20260911102357_default_user_as_adopter`.

3. **Erro `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`**:
   - **Causa**: Hoisting estático de importações ES Modules no Node.js. Ao importar as rotas, o `PrismaService` era instanciado antes da execução de `dotenv.config()`. Sem variáveis carregadas, o pool do `pg` conectava com senha `undefined`, falhando na autenticação SCRAM do PostgreSQL.
   - **Solução**: Criação do módulo [`apps/server/src/config/env.ts`](apps/server/src/config/env.ts) importado no topo de `index.ts` e `PrismaService.ts`, além de encapsular o cliente `prisma` em um `Proxy` de inicialização preguiçosa (*lazy initialization*).

4. **Preservação de Casing no Avatar (`Url.ts`)**:
   - **Causa**: [`Url.create`](apps/server/src/domains/Url.ts) executava `.toLowerCase()` em toda a URL. Como os hashes e tokens de imagem de perfil do Google são em Base64 case-sensitive, a URL gerava erro 404 / imagem quebrada.
   - **Solução**: Removido o `.toLowerCase()`. A construção via `new URL(trimmed)` normaliza apenas o protocolo e domínio em minúsculas, mantendo intactos caminhos, parâmetros de consulta e identificadores sensíveis a maiúsculas/minúsculas.

5. **Incompatibilidade de Versões React (`19.2.3` vs `19.3.0`)**:
   - **Causa**: Resolução cruzada de dependências por ferramenta de pacote externa que introduziu versões divergentes de `react-dom`.
   - **Solução**: Limpeza de links simbólicos e revalidação via `npm install`, alinhando estritamente `react` e `react-dom` na versão `19.2.3` em todos os pacotes.

---

### 1.3 Interface Mobile e Web (Cadastros e Estilos)

- As telas de cadastro de animal e usuário utilizam NativeWind / Tailwind CSS.
- Token `shadow-card` configurado para consistência visual dos cards.
- Layouts e formulários seguem os padrões definidos no `DESIGN.md`.
- `PrimaryInputText` com suporte a campos de senha (`isPassword`).
- Rota administrativa `/cadastro-usuario` restrita a administradores autenticados.
- Rota pública temporária `/cadastro-animal` com proteção no servidor mantida via JWT.

---

### 1.4 Upload de Fotos e Storage S3 / MinIO

- Upload de fotos de animais opcional via `multipart/form-data` em `POST /api/animals/:id/photos`.
- Formatos aceitos: JPEG, PNG e WebP até 5 MB com validação de assinatura binária (magic numbers).
- Armazenamento em serviço compatível com S3 (MinIO localmente através do bucket público `kapa-public`).
- Registro do link na tabela `tb_animal_photos`.

---

## 2. Infraestrutura Docker Local

O arquivo `apps/server/docker-compose.yaml` gerencia os serviços de suporte:

| Serviço | Container | Porta | Função |
| --- | --- | --- | --- |
| PostgreSQL | `kapa-database` | `5432` | Banco de dados relacional principal |
| Redis | `kapa-redis` | `6379` | Cache e sessões |
| MinIO API | `kapa-storage` | `9000` | API compatível com S3 para upload de arquivos |
| MinIO Console | `kapa-storage` | `9001` | Painel web administrativo do MinIO |
| Inicializador | `storage-init` | — | Cria e configura as permissões do bucket local |

> **Nota:** O container `storage-init` finalizar com status `Exited (0)` é o comportamento esperado, pois executa um script de provisionamento inicial.

### Credenciais Locais de Desenvolvimento

- **PostgreSQL**: Usuário `docker`, Senha `docker`, Banco `kapa`
- **Redis**: Senha `kapa`
- **MinIO**: Usuário `kapa`, Senha `kapa-local-storage-secret`

---

## 3. Guia de Configuração e Execução

### 3.1 Pré-requisitos
- Node.js 20+ (recomendado Node 22+)
- npm 10+
- Docker e Docker Compose

### 3.2 Passo a Passo de Inicialização

1. **Instalar dependências na raiz do monorepo**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   - Servidor:
     ```bash
     cp apps/server/.env.example apps/server/.env
     ```
   - Mobile/Web:
     ```bash
     cp apps/mobile-web/.env.example apps/mobile-web/.env
     ```
   *(Preencha os Client IDs do Google OAuth em ambos os arquivos).*

3. **Subir a infraestrutura Docker**:
   ```bash
   docker compose -f apps/server/docker-compose.yaml up -d
   ```

4. **Aplicar as migrations existentes do PostgreSQL**:
   ```bash
   npm run prisma:migrate --workspace=@kapa/server # ou npx prisma migrate deploy dentro de apps/server
   ```

5. **Iniciar API e Expo juntos**:
   ```bash
   npm run dev
   ```
   Ou em terminais separados:
   - Backend: `npm run dev:server` (ou `cd apps/server && npm run dev`)
   - Frontend: `npm run web` (ou `npm run start:mobile`)

### 3.3 Endereços dos Serviços Locais
- **API Express**: `http://localhost:4000`
- **Health Check da API**: `http://localhost:4000/api/health`
- **Aplicação Web (Expo)**: `http://localhost:8081`
- **Console do MinIO**: `http://localhost:9001`

---

## 4. Variáveis de Ambiente Relevantes

| Variável | Escopo | Descrição |
| --- | --- | --- |
| `PORT` | Backend | Porta HTTP do servidor Express (padrão `4000`) |
| `DATABASE_URL` | Backend | String de conexão com o PostgreSQL |
| `JWT_SECRET` | Backend | Segredo para assinatura de tokens JWT da aplicação |
| `CLIENT_URL` | Backend | URL do cliente para validação de CORS (padrão `http://localhost:8081`) |
| `GOOGLE_CLIENT_ID` | Backend | Client ID principal para validação de tokens Google |
| `GOOGLE_WEB_CLIENT_ID` | Backend | Client ID da aplicação Web para checagem de audiência |
| `GOOGLE_IOS_CLIENT_ID` | Backend | Client ID da aplicação iOS |
| `GOOGLE_ANDROID_CLIENT_ID` | Backend | Client ID da aplicação Android |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Mobile/Web | Client ID Google usado no navegador pelo Expo |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Mobile/Web | Client ID Google nativo para iOS |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Mobile/Web | Client ID Google nativo para Android |
| `EXPO_PUBLIC_API_URL` | Mobile/Web | URL base da API Kapa (padrão `http://localhost:4000/api`) |

---

## 5. Validação de Qualidade e Testes

Antes de submeter novos commits ou abrir Pull Requests, execute as seguintes verificações:

```bash
# 1. Executar bateria de testes automatizados do backend (14 testes)
npm run test --workspace=@kapa/server

# 2. Verificação de tipos TypeScript no backend
npx tsc --noEmit -p apps/server/tsconfig.json

# 3. Verificação de tipos TypeScript no frontend
npx tsc --noEmit -p apps/mobile-web/tsconfig.json

# 4. Verificação de linting
npm run lint
```

> **Lembrete de Segurança:** Nunca faça commit de arquivos `.env` e nunca modifique esquemas do banco ou crie migrations sem alinhamento e aprovação prévia com a equipe.