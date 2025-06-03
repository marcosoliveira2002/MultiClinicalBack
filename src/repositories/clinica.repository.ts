import { prisma } from '../config/prismaClient';

export class ClinicaRepository {
  async criar(data: any) {
    return prisma.clinica.create({ data });
  }

  async buscarPorEmail(email: string) {
    return prisma.clinica.findUnique({ where: { email_clinica: email } });
  }
}
