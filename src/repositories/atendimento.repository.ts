import { prisma } from '../config/prismaClient';

export class AtendimentoRepository {
  async criar(data: any) {
    return prisma.atendimento.create({ data });
  }
}
