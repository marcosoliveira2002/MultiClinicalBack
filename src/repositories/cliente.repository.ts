import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export class ClienteRepository {
create(data: any) { return prisma.cliente.create({ data }); }

update(id: string, data: any) { return prisma.cliente.update({ where: { id_cliente: id }, data }); }

findById(id: string) { return prisma.cliente.findUnique({ where: { id_cliente: id } }); }

findByCpf(cpf: string) { return prisma.cliente.findUnique({ where: { cpf } }); }

count(where: any) { return prisma.cliente.count({ where }); }

findMany(where: any, orderBy: any, skip: number, take: number) {
return prisma.cliente.findMany({ where, orderBy, skip, take });
}
}