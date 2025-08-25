import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export class ProcedimentoRepository {
create(data: any) { return prisma.procedimento.create({ data }); }
update(id: string, data: any) { return prisma.procedimento.update({ where: { id_procedimento: id }, data }); }
findById(id: string) { return prisma.procedimento.findUnique({ where: { id_procedimento: id } }); }
findByNome(nome: string) { return prisma.procedimento.findFirst({ where: { nome_procedimento: nome } }); }
count(where: any) { return prisma.procedimento.count({ where }); }
findMany(where: any, orderBy: any, skip: number, take: number) {
return prisma.procedimento.findMany({ where, orderBy, skip, take });
}
}