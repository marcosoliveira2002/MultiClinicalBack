import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const loginAdmin = 'admin';
  const senhaAdmin = '123456'; // Troque para uma mais segura
  const nomeAdmin = 'Administrador do Sistema';

  // Verifica se já existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { login: loginAdmin },
  });

  if (usuarioExistente) {
    console.log(`Usuário admin "${loginAdmin}" já existe. Seed ignorado.`);
    return;
  }

  // Cria o hash da senha
  const senhaHash = await bcrypt.hash(senhaAdmin, 10);

  // Cria o usuário admin
  await prisma.usuario.create({
    data: {
      nome_usuario: nomeAdmin,
      login: loginAdmin,
      senha: senhaHash,
      email: 'dev6@aproms.com', // A para Administrador
      ativo: true,
    },
  });

  console.log(`Usuário admin criado: login="${loginAdmin}" senha="${senhaAdmin}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
