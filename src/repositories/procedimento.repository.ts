import { prisma } from '../config/prismaClient';

export class ProcedimentoRepository {
  async criar(data: any) {
    return prisma.procedimento.create({ data });
  }
}
