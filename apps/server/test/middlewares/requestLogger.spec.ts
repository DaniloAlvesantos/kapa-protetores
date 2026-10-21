import type { AddressInfo } from 'node:net';
import { Writable } from 'node:stream';
import { Router } from 'express';
import { App } from '../../src/App';
import { createLogger, logger as defaultLogger } from '../../src/config/logger';
import { BadRequestError, InternalServerError } from '../../src/errors';
import { ErrorHandler } from '../../src/middlewares/ErrorHandler';
import {
  createRequestLogger,
  resolveRequestId,
} from '../../src/middlewares/requestLogger';

function createCapturedLogger() {
  const entries: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      const text = chunk.toString().trim();
      if (text) {
        entries.push(JSON.parse(text) as Record<string, unknown>);
      }
      callback();
    },
  });
  const logger = createLogger(
    { NODE_ENV: 'production', LOG_LEVEL: 'trace' },
    stream,
  );
  return { entries, logger };
}

describe('HTTP Request Logger & Centralized ErrorHandler Integration', () => {
  describe('resolveRequestId', () => {
    it('returns a valid incoming X-Request-Id header unchanged', () => {
      expect(resolveRequestId('req-abc_123.456')).toBe('req-abc_123.456');
      expect(resolveRequestId(['req-first-id', 'req-second-id'])).toBe(
        'req-first-id',
      );
    });

    it('generates a fresh UUID when X-Request-Id is missing or contains unsafe characters', () => {
      const generatedFromMissing = resolveRequestId(undefined);
      const generatedFromInjection = resolveRequestId(
        'malicious-id\r\nInjected-Header: true',
      );
      const generatedFromTooLong = resolveRequestId('a'.repeat(200));

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(generatedFromMissing).toMatch(uuidRegex);
      expect(generatedFromInjection).toMatch(uuidRegex);
      expect(generatedFromTooLong).toMatch(uuidRegex);
    });
  });

  describe('Express middleware and ErrorHandler correlation', () => {
    it('assigns X-Request-Id and logs method, path, statusCode, and durationMs on HTTP requests', async () => {
      const { entries, logger } = createCapturedLogger();
      const router = Router();

      router.use(createRequestLogger(logger));
      router.get('/animals', (_req, res) => {
        res.status(200).json({ ok: true });
      });

      const app = new App(
        { router },
        { port: 0, clientUrl: 'http://localhost:8081' },
      );

      const server = app.listen();
      await new Promise<void>((resolve) => server.once('listening', resolve));

      try {
        const { port } = server.address() as AddressInfo;
        const response = await fetch(
          `http://127.0.0.1:${port}/api/animals`,
          {
            headers: {
              'X-Request-Id': 'trace-correlation-001',
              'User-Agent': 'KapaTestAgent/1.0',
            },
          },
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('x-request-id')).toBe(
          'trace-correlation-001',
        );
      } finally {
        await app.close();
      }

      const logEntry = entries.find(
        (entry) => entry.requestId === 'trace-correlation-001',
      );
      expect(logEntry).toBeDefined();
      expect(logEntry).toMatchObject({
        level: 'info',
        requestId: 'trace-correlation-001',
        method: 'GET',
        path: '/api/animals',
        statusCode: 200,
        userAgent: 'KapaTestAgent/1.0',
      });
      expect(typeof logEntry?.durationMs).toBe('number');
    });

    it('logs 4xx HttpErrors as warn and 5xx unhandled errors as error with stack trace without leaking internals in HTTP response', async () => {
      const { entries, logger } = createCapturedLogger();
      const reqLogger = createRequestLogger(logger);

      const next = jest.fn();
      const mockReq400 = {
        method: 'POST',
        originalUrl: '/api/users/login',
        url: '/api/users/login',
        ip: '127.0.0.1',
        headers: { 'x-request-id': 'req-400-test' },
      } as unknown as Parameters<typeof reqLogger>[0];

      let finishListener400: (() => void) | undefined;
      const mockRes400 = {
        statusCode: 200,
        setHeader: jest.fn(),
        on: jest.fn((event: string, cb: () => void) => {
          if (event === 'finish') finishListener400 = cb;
        }),
        status: jest.fn(function (this: { statusCode: number }, code: number) {
          this.statusCode = code;
          return this;
        }),
        json: jest.fn(),
      } as unknown as Parameters<typeof reqLogger>[1];

      const warnSpy = jest.spyOn(defaultLogger, 'warn');
      const errorSpy = jest.spyOn(defaultLogger, 'error');

      try {
        reqLogger(mockReq400, mockRes400, next);
        ErrorHandler.handle(
          new BadRequestError('Invalid email format'),
          mockReq400,
          mockRes400,
          next,
        );
        finishListener400?.();

        expect(mockRes400.status).toHaveBeenCalledWith(400);
        expect(mockRes400.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid email format',
          }),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: 'req-400-test',
            statusCode: 400,
          }),
          'Invalid email format',
        );
        expect(
          entries.some((e) => e.level === 'warn' && e.statusCode === 400),
        ).toBe(true);

        const mockReq500Http = {
          method: 'POST',
          originalUrl: '/api/animals',
          url: '/api/animals',
          ip: '127.0.0.1',
          requestId: 'req-500-http-error',
          headers: {},
        } as unknown as Parameters<typeof reqLogger>[0];

        const mockRes500Http = {
          statusCode: 500,
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Parameters<typeof reqLogger>[1];

        ErrorHandler.handle(
          new InternalServerError('Internal service failure'),
          mockReq500Http,
          mockRes500Http,
          next,
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: 'req-500-http-error',
          }),
          'Unhandled server error',
        );

        const mockReq500 = {
          method: 'GET',
          originalUrl: '/api/animals',
          url: '/api/animals',
          ip: '127.0.0.1',
          requestId: 'req-500-secret-db',
          headers: {},
        } as unknown as Parameters<typeof reqLogger>[0];

        const mockRes500 = {
          statusCode: 500,
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Parameters<typeof reqLogger>[1];

        ErrorHandler.handle(
          new Error('Postgres connection failed at 192.168.1.50:5432'),
          mockReq500,
          mockRes500,
          next,
        );

        expect(mockRes500.status).toHaveBeenCalledWith(500);
        expect(mockRes500.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'InternalServerError',
            message: 'Erro interno do servidor',
            success: false,
          }),
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: 'req-500-secret-db',
          }),
          'Unhandled server error',
        );
        const responsePayload = JSON.stringify(
          (mockRes500.json as jest.Mock).mock.calls[0]?.[0],
        );
        expect(responsePayload).not.toContain('192.168.1.50');
      } finally {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      }
    });
  });
});
