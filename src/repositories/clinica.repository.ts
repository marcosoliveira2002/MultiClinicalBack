import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export class ClinicaRepository {
  create(data: any) { return prisma.clinica.create({ data }); }
  update(id: string, data: any) { return prisma.clinica.update({ where: { id_clinica: id }, data }); }
  findById(id: string) { return prisma.clinica.findUnique({ where: { id_clinica: id } }); }
  findByEmail(email: string) { return prisma.clinica.findUnique({ where: { email_clinica: email } }); }
  count(where: any) { return prisma.clinica.count({ where }); }
  findMany(where: any, orderBy: any, skip: number, take: number) {
    return prisma.clinica.findMany({ where, orderBy, skip, take });
  }
}