import app from './app';
import dotenv from 'dotenv';
import { seedAdminUser } from './bootstrap/seedAdmin';

dotenv.config();

const PORT = process.env.PORT || 3333;

async function start() {
  try {

    if (process.env.NODE_ENV !== 'production') {
      await seedAdminUser();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
    process.exit(1);
  }
}

start();
