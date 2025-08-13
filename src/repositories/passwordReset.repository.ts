// src/repositories/passwordReset.repository.ts
import { prisma } from '../config/prismaClient';

export class PasswordResetRepository {
  async invalidarTokensAtivosDoUsuario(userId: string) {
    await prisma.passwordReset.updateMany({
      where: { user_id: userId, used: false },
      data: { used: true }
    });
  }

  async criarToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordReset.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt
      }
    });
  }

  async obterTokenValidoPorHash(tokenHash: string) {
    return prisma.passwordReset.findFirst({
      where: {
        token_hash: tokenHash,
        used: false,
        expires_at: { gt: new Date() }
      }
    });
  }

  async marcarComoUsado(id: string) {
    await prisma.passwordReset.update({
      where: { id },
      data: { used: true }
    });
  }

  async marcarTodosDoUsuarioComoUsados(userId: string) {
    await prisma.passwordReset.updateMany({
      where: { user_id: userId, used: false },
      data: { used: true }
    });
  }
}
