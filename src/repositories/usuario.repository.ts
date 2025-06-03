import { prisma } from '../config/prismaClient';

export class UsuarioRepository {
  async criar(data: any) {
    return prisma.usuario.create({ data });
  }

  async buscarPorLogin(login: string) {
    return prisma.usuario.findUnique({
      where: { login }
    });
  }
}
