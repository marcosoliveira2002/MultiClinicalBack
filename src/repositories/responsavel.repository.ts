import { prisma } from '../config/prismaClient';

export class ResponsavelRepository {
  async criar(data: any) {
    return prisma.responsavel.create({ data });
  }
}
