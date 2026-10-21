import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import pino from 'pino';
import {
  buildLoggerOptions,
  buildTransportTargets,
  createLogger,
} from '../../src/config/logger';

function createMemoryDestination() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      const text = chunk.toString().trim();
      if (text) {
        lines.push(JSON.parse(text) as Record<string, unknown>);
      }
      callback();
    },
  });
  return { lines, stream };
}

describe('Centralized Pino Logger (config/logger)', () => {
  it('builds default options by environment (development, production, test)', () => {
    const devOpts = buildLoggerOptions({ NODE_ENV: 'development' });
    expect(devOpts.level).toBe('debug');
    expect(devOpts.base).toEqual({ service: 'kapa-server', env: 'development' });

    const prodOpts = buildLoggerOptions({ NODE_ENV: 'production' });
    expect(prodOpts.level).toBe('info');
    expect(prodOpts.base).toEqual({ service: 'kapa-server', env: 'production' });

    const testOpts = buildLoggerOptions({ NODE_ENV: 'test' });
    expect(testOpts.level).toBe('silent');
    expect(testOpts.base).toEqual({ service: 'kapa-server', env: 'test' });
  });

  it('emits structured JSON logs across trace, debug, info, warn, error, and fatal levels', () => {
    const { lines, stream } = createMemoryDestination();
    const log = createLogger(
      { NODE_ENV: 'development', LOG_LEVEL: 'trace' },
      stream,
    );

    log.trace({ step: 1 }, 'trace event');
    log.debug({ step: 2 }, 'debug event');
    log.info({ step: 3 }, 'info event');
    log.warn({ step: 4 }, 'warn event');
    log.error({ err: new Error('boom') }, 'error event');
    log.fatal({ step: 6 }, 'fatal event');

    expect(lines).toHaveLength(6);
    expect(lines.map((entry) => entry.level)).toEqual([
      'trace',
      'debug',
      'info',
      'warn',
      'error',
      'fatal',
    ]);
    expect(lines[0]).toMatchObject({
      level: 'trace',
      service: 'kapa-server',
      env: 'development',
      step: 1,
      msg: 'trace event',
    });
    expect(typeof lines[0]?.time).toBe('string');
    expect(lines[4]).toMatchObject({
      level: 'error',
      msg: 'error event',
      err: expect.objectContaining({
        message: 'boom',
        stack: expect.stringContaining('Error: boom'),
      }),
    });
  });

  it('redacts sensitive fields (passwords, JWTs, tokens, authorization headers, cookies, secrets)', () => {
    const { lines, stream } = createMemoryDestination();
    const log = createLogger(
      { NODE_ENV: 'production', LOG_LEVEL: 'info' },
      stream,
    );

    log.info(
      {
        password: 'plain-password-123',
        currentPassword: 'old-password',
        newPassword: 'new-password',
        token: 'dummy-token-for-redaction-test', // gitleaks:allow
        accessToken: 'access-secret',
        refreshToken: 'refresh-secret',
        jwt: 'raw-jwt-token',
        secret: 'top-secret',
        apiKey: 'api-key-value',
        cpf: '123.456.789-00',
        user: {
          email: 'adopter@kapa.org',
          password: 'nested-password',
          token: 'nested-token',
        },
        req: {
          headers: {
            authorization: 'Bearer super-secret-jwt',
            cookie: 'session=secret-cookie',
          },
        },
      },
      'Authentication attempt',
    );

    expect(lines).toHaveLength(1);
    const entry = lines[0] as Record<string, unknown>;
    const rawJson = JSON.stringify(entry);

    expect(entry.password).toBe('[REDACTED]');
    expect(entry.currentPassword).toBe('[REDACTED]');
    expect(entry.newPassword).toBe('[REDACTED]');
    expect(entry.token).toBe('[REDACTED]');
    expect(entry.accessToken).toBe('[REDACTED]');
    expect(entry.refreshToken).toBe('[REDACTED]');
    expect(entry.jwt).toBe('[REDACTED]');
    expect(entry.secret).toBe('[REDACTED]');
    expect(entry.apiKey).toBe('[REDACTED]');
    expect(entry.cpf).toBe('[REDACTED]');
    expect(entry.user).toEqual({
      email: 'adopter@kapa.org',
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
    expect(entry.req).toEqual({
      headers: {
        authorization: '[REDACTED]',
        cookie: '[REDACTED]',
      },
    });
    expect(rawJson).not.toContain('plain-password-123');
    expect(rawJson).not.toContain('super-secret-jwt');
    expect(rawJson).not.toContain('secret-cookie');
  });

  it('configures transport targets with pino-pretty in development, stdout in production, and pino-roll file rotation', () => {
    const devTargets = buildTransportTargets({
      NODE_ENV: 'development',
      LOG_TO_FILE: 'true',
      LOG_DIR: './custom-logs',
      LOG_MAX_SIZE: '5m',
      LOG_FREQUENCY: 'daily',
      LOG_RETENTION_COUNT: '10',
    });

    expect(devTargets).toHaveLength(3);
    expect(devTargets[0]?.target).toBe('pino-pretty');
    expect(devTargets[1]).toMatchObject({
      target: 'pino-roll',
      level: 'info',
      options: expect.objectContaining({
        extension: '.log',
        size: '5m',
        frequency: 'daily',
        mkdir: true,
        limit: { count: 10 },
      }),
    });
    expect(devTargets[2]).toMatchObject({
      target: 'pino-roll',
      level: 'error',
    });

    const prodNoFileTargets = buildTransportTargets({
      NODE_ENV: 'production',
      LOG_TO_FILE: 'false',
    });
    expect(prodNoFileTargets).toEqual([
      {
        target: 'pino/file',
        level: 'info',
        options: { destination: 1 },
      },
    ]);

    expect(buildTransportTargets({ NODE_ENV: 'test' })).toEqual([]);
  });

  it('persists structured JSON logs to a file destination', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kapa-logger-test-'));
    const logFile = path.join(tempDir, 'app.log');

    try {
      const destination = pino.destination({ dest: logFile, sync: true });
      const fileLogger = createLogger(
        { NODE_ENV: 'production', LOG_LEVEL: 'info' },
        destination,
      );

      fileLogger.info({ event: 'server_boot' }, 'Server persisted log');
      destination.flushSync();

      const content = fs.readFileSync(logFile, 'utf8').trim();
      const parsed = JSON.parse(content) as Record<string, unknown>;

      expect(parsed).toMatchObject({
        level: 'info',
        service: 'kapa-server',
        env: 'production',
        event: 'server_boot',
        msg: 'Server persisted log',
      });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
