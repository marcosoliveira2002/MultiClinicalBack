import { prisma } from '../config/prismaClient';

export class ClienteRepository {
  async criar(data: any) {
    return prisma.cliente.create({ data });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.cliente.findUnique({ where: { cpf } });
  }
}
