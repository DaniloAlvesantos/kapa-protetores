import path from 'node:path';
import pino, {
  type DestinationStream,
  type Logger,
  type LoggerOptions,
  type TransportTargetOptions,
} from 'pino';

export const REDACTED_PATHS: string[] = [
  'password',
  'currentPassword',
  'newPassword',
  'token',
  'idToken',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'set-cookie',
  'jwt',
  'secret',
  'apiKey',
  'cpf',
  '*.password',
  '*.currentPassword',
  '*.newPassword',
  '*.token',
  '*.idToken',
  '*.accessToken',
  '*.refreshToken',
  '*.authorization',
  '*.cookie',
  '*.jwt',
  '*.secret',
  '*.apiKey',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

export interface LoggerConfigEnv {
  NODE_ENV?: string;
  LOG_LEVEL?: string;
  LOG_TO_FILE?: string;
  LOG_DIR?: string;
  LOG_MAX_SIZE?: string;
  LOG_FREQUENCY?: string;
  LOG_RETENTION_COUNT?: string;
}

export function buildLoggerOptions(
  env: LoggerConfigEnv = process.env,
): LoggerOptions {
  const nodeEnv = env.NODE_ENV || 'development';
  const defaultLevel =
    nodeEnv === 'test'
      ? 'silent'
      : nodeEnv === 'production'
        ? 'info'
        : 'debug';

  return {
    level: env.LOG_LEVEL || defaultLevel,
    base: {
      service: 'kapa-server',
      env: nodeEnv,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    redact: {
      paths: REDACTED_PATHS,
      censor: '[REDACTED]',
    },
  };
}

export function buildTransportTargets(
  env: LoggerConfigEnv = process.env,
): TransportTargetOptions[] {
  const nodeEnv = env.NODE_ENV || 'development';
  if (nodeEnv === 'test') {
    return [];
  }

  const level = env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug');
  const logToFile = env.LOG_TO_FILE !== 'false';
  const logDir = path.resolve(process.cwd(), env.LOG_DIR || 'logs');
  const maxSize = env.LOG_MAX_SIZE || '10m';
  const frequency = env.LOG_FREQUENCY || 'daily';
  const retentionCount = Math.max(1, Number(env.LOG_RETENTION_COUNT) || 7);

  const targets: TransportTargetOptions[] = [];

  if (nodeEnv === 'production') {
    targets.push({
      target: 'pino/file',
      level,
      options: { destination: 1 },
    });
  } else {
    targets.push({
      target: 'pino-pretty',
      level,
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    });
  }

  if (logToFile) {
    targets.push(
      {
        target: 'pino-roll',
        level: 'info',
        options: {
          file: path.join(logDir, 'app'),
          extension: '.log',
          size: maxSize,
          frequency,
          mkdir: true,
          limit: { count: retentionCount },
        },
      },
      {
        target: 'pino-roll',
        level: 'error',
        options: {
          file: path.join(logDir, 'error'),
          extension: '.log',
          size: maxSize,
          frequency,
          mkdir: true,
          limit: { count: retentionCount },
        },
      },
    );
  }

  return targets;
}

export function createLogger(
  env: LoggerConfigEnv = process.env,
  destination?: DestinationStream,
): Logger {
  const options = buildLoggerOptions(env);
  if (destination) {
    return pino(options, destination);
  }

  const targets = buildTransportTargets(env);
  if (targets.length === 0) {
    return pino(options);
  }

  return pino(options, pino.transport({ targets }));
}

export const logger = createLogger();
