import '../src/config/env';
import { PrismaService } from '../src/database/PrismaService';

export interface DatabaseCheckService {
  client: {
    $queryRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
  };
  disconnect: () => Promise<void>;
}

export async function checkDatabase(
  service: DatabaseCheckService = PrismaService.getInstance(),
): Promise<void> {
  try {
    await service.client.$queryRaw`SELECT 1`;
    console.log(JSON.stringify({ event: 'database_connection_ok' }));
  } finally {
    await service.disconnect();
  }
}

export async function run(): Promise<void> {
  try {
    await checkDatabase();
  } catch {
    console.error(
      JSON.stringify({
        event: 'database_connection_failed',
        message: 'Confira DATABASE_URL, rede e certificado TLS.',
      }),
    );
    process.exitCode = 1;
  }
}

if (process.env.NODE_ENV !== 'test') {
  void run();
}

