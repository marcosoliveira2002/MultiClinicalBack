import { prisma } from '../config/prismaClient';

export class TipoAtendimentoRepository {
  async criar(data: any) {
    return prisma.tipoAtendimento.create({ data });
  }
}
