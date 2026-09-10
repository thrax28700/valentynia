import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`✨ Valentynia API à l'écoute sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} reçu — arrêt en douceur…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
