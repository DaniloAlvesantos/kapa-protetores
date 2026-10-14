import { checkDatabase, run } from '../../scripts/check-database';

describe('check-database script', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('logs database_connection_ok and disconnects when query succeeds', async () => {
    const mockQueryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);
    const mockService = {
      client: { $queryRaw: mockQueryRaw },
      disconnect: mockDisconnect,
    };

    await checkDatabase(mockService);

    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify({ event: 'database_connection_ok' }),
    );
  });

  it('ensures disconnect is called even when query fails', async () => {
    const mockQueryRaw = jest.fn().mockRejectedValue(new Error('Connection failed'));
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);
    const mockService = {
      client: { $queryRaw: mockQueryRaw },
      disconnect: mockDisconnect,
    };

    await expect(checkDatabase(mockService)).rejects.toThrow('Connection failed');
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('run handles connection failure, logs error and sets exitCode', async () => {
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://invalid:invalid@localhost:5432/nonexistent';

    await run();

    expect(errorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'database_connection_failed',
        message: 'Confira DATABASE_URL, rede e certificado TLS.',
      }),
    );
    expect(process.exitCode).toBe(1);

    process.env.DATABASE_URL = originalEnv;
  });
});
