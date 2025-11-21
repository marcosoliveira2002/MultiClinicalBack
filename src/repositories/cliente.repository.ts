import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class ClienteRepository {
  create(data: any) {
    return prisma.cliente.create({
      data,
      include: { responsavel: true }, 
    });
  }

  update(id: string, data: any) {
    return prisma.cliente.update({
      where: { id_cliente: id },
      data,
      include: { responsavel: true }, 
    });
  }

  findById(id: string) {
    return prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: { responsavel: true }, 
    });
  }

  findByCpf(cpf: string) {
    return prisma.cliente.findUnique({
      where: { cpf },
      include: { responsavel: true }, 
    });
  }

  count(where: any) {
    return prisma.cliente.count({ where });
  }

  findMany(where: any, orderBy: any, skip: number, take: number) {
    return prisma.cliente.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { responsavel: true }, 
    });
  }
}
