import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdminUser() {
  const loginAdmin = 'admin';
  const emailAdmin = 'admin@local.test';
  const senhaAdmin = '123456';
  const nomeAdmin = 'Administrador do Sistema';

  const usuarioPorLogin = await prisma.usuario.findUnique({ where: { login: loginAdmin } });
  const usuarioPorEmail = await prisma.usuario.findUnique({ where: { email: emailAdmin } });

  if (usuarioPorLogin || usuarioPorEmail) {
    console.log(`🔁 Seed: admin já existe (login ou email). Pulando...`);
    return;
  }

  const senhaHash = await bcrypt.hash(senhaAdmin, 10);

  await prisma.usuario.create({
    data: {
      nome_usuario: nomeAdmin,
      login: loginAdmin,
      email: emailAdmin,
      senha: senhaHash,
      ativo: true,
    },
  });

  console.log(`✅ Seed: usuário admin criado — login="${loginAdmin}" email="${emailAdmin}" senha="${senhaAdmin}"`);
}
