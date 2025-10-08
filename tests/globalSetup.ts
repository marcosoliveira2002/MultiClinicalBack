import { execSync } from 'node:child_process';

export default async function () {
  process.env.NODE_ENV = 'test';

  // Se você quiser só “subir o schema” rápido:
  // execSync('npx prisma db push', { stdio: 'inherit' });

  // Se você já versiona migrações:
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (e) {
    // Se não tiver migrações ainda, pode ignorar
    console.warn('[globalSetup] migrate deploy falhou (ok se não houver migrações).');
  }

  // Opcional: seed
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch {
    // ok se você não usa seed
  }
}
