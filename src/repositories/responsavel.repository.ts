import { prisma } from '../config/prismaClient';

export class ResponsavelRepository {
  async criar(data: any) {
    return prisma.responsavel.create({ data });
  }

  delete(id_responsavel: string) {
    return prisma.responsavel.delete({
      where: { id_responsavel },
    });
  }

  findById(id_responsavel: string) {
    return prisma.responsavel.findUnique({
      where: { id_responsavel },
      include: { cliente: true }, // se quiser saber se está vinculado
    });
  }

}
