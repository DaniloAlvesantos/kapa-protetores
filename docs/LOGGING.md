# Sistema Centralizado de Logging (`@kapa/server`)

O backend utiliza o **Pino** (`pino`, `pino-roll` e `pino-pretty`) para registrar eventos da aplicação, requisições HTTP e erros em formato JSON estruturado, com persistência e rotação automática em arquivos e preparação para ferramentas de observabilidade (Grafana Loki, OpenTelemetry e Datadog).

---

## 1. Estrutura e Principais Funções

### `apps/server/src/config/logger.ts`

Módulo central que configura e exporta o logger da aplicação:

- **`logger`**: instância principal do Pino usada em todo o servidor (`logger.trace`, `logger.debug`, `logger.info`, `logger.warn`, `logger.error`, `logger.fatal`).
- **`buildLoggerOptions(env?)`**: monta as opções base do Pino:
  - Define o nível padrão conforme o `NODE_ENV` (`debug` em `development`, `info` em `production` e `silent` em `test`).
  - Adiciona metadados fixos (`service: 'kapa-server'` e `env`) e timestamp ISO 8601.
  - Aplica a lista `REDACTED_PATHS` para substituir dados sensíveis por `"[REDACTED]"`.
- **`buildTransportTargets(env?)`**: configura os destinos (transports) de saída:
  - **Console**: `pino-pretty` colorido em `development` e JSON puro em `stdout` em `production`.
  - **Arquivos (`pino-roll`)**: cria e rotaciona automaticamente `logs/app.<data>.<seq>.log` (nível `info` ou superior) e `logs/error.<data>.<seq>.log` (nível `error` e `fatal`).
- **`createLogger(env?, destination?)`**: fábrica que instancia o logger; aceita um stream customizado (`destination`) para facilitar testes em memória ou em arquivos temporários.

### `apps/server/src/middlewares/requestLogger.ts`

Middleware Express responsável por rastrear e registrar todas as requisições HTTP:

- **`resolveRequestId(headerValue)`**: valida o cabeçalho `X-Request-Id` recebido (aceitando apenas `[a-zA-Z0-9._-]` de até 128 caracteres para evitar *log injection*) ou gera um novo UUID v4 caso ausente ou inválido.
- **`createRequestLogger(log?)` / `requestLogger`**:
  - Define `req.requestId` e devolve o cabeçalho `X-Request-Id` na resposta HTTP.
  - Ao finalizar a resposta (`res.on('finish')`), calcula o tempo de execução (`durationMs`) e registra `method`, `path`, `statusCode`, `durationMs`, `ip`, `userAgent` e `userId` (`req.user?.sub`).
  - Escolhe o nível automaticamente: `info` (`2xx`/`3xx`), `warn` (`4xx`) ou `error` (`5xx`).

### `apps/server/src/middlewares/ErrorHandler.ts`

- **`ErrorHandler.handle(err, req, res, next)`**:
  - Registra erros de cliente (`4xx` e `MulterError`) como `warn` junto ao `requestId`, método, rota e `userId`.
  - Registra erros inesperados (`5xx`) como `error` incluindo o objeto `err` (stack trace completo nos logs do servidor), mas retorna apenas a mensagem genérica (`Erro interno do servidor`) na resposta HTTP para não expor detalhes internos.

---

## 2. Variáveis de Ambiente (`apps/server/.env`)

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) / `silent` (test) | Nível mínimo de log (`trace`, `debug`, `info`, `warn`, `error`, `fatal`). |
| `LOG_TO_FILE` | `true` | Ativa (`true`) ou desativa (`false`) a gravação em arquivos. |
| `LOG_DIR` | `./logs` | Diretório onde os arquivos de log são salvos (ignorado pelo Git). |
| `LOG_MAX_SIZE` | `10m` | Tamanho máximo por arquivo antes de rotacionar. |
| `LOG_FREQUENCY` | `daily` | Frequência de rotação dos arquivos (`daily` ou `hourly`). |
| `LOG_RETENTION_COUNT` | `14` | Quantidade máxima de arquivos rotacionados mantidos por tipo (`app` e `error`). |

---

## 3. Como Utilizar no Código

Importe `logger` de `config/logger` e passe sempre um objeto estruturado no primeiro argumento e a mensagem descritiva no segundo:

```ts
import { logger } from '../config/logger';

// Evento informativo
logger.info({ animalId: animal.id, userId: req.user?.sub }, 'Animal cadastrado com sucesso');

// Aviso (ex.: fallback ou tentativa inválida)
logger.warn({ cacheKey }, 'Chave de cache inválida, buscando no banco');

// Erro (sempre passe o erro na chave `err` para serializar o stack trace)
logger.error({ err, requestId: req.requestId }, 'Falha ao salvar foto no storage');
```

---

## 4. Segurança e Proteção de Dados

- **Redação Automática**: qualquer campo chamado `password`, `currentPassword`, `newPassword`, `token`, `idToken`, `accessToken`, `refreshToken`, `authorization`, `cookie`, `set-cookie`, `jwt`, `secret`, `apiKey` ou `cpf` (inclusive aninhado em objetos ou em `req.headers`) é mascarado como `"[REDACTED]"` antes de ser gravado.
- **Git Ignore**: os diretórios `logs/` e `apps/server/logs/` e arquivos `*.log` estão configurados no `.gitignore` para nunca serem versionados.

---

## 5. Testes

Para executar os testes unitários e de integração do logger e do middleware HTTP:

```sh
npm test --workspace=@kapa/server -- test/config/logger.spec.ts test/middlewares/requestLogger.spec.ts
```
