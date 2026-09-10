import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Charge .env.test AVANT le code applicatif (branche Neon dédiée aux tests).
config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    fileParallelism: false, // les tests d'intégration partagent la base de test
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
});
