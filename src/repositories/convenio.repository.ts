import { prisma } from '../config/prismaClient';

export class ConvenioRepository {
  async criar(data: any) {
    return prisma.convenio.create({ data });
  }

  async buscarPorEmail(email: string) {
    return prisma.convenio.findUnique({ where: { email_contato_convenio: email } });
  }
}
