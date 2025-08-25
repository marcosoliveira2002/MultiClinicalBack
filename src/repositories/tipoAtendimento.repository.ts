import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export class TipoAtendimentoRepository {
create(data: any) {
return prisma.tipoAtendimento.create({ data });
}
update(id: string, data: any) {
return prisma.tipoAtendimento.update({ where: { id_tipo_atendimento: id }, data });
}
findById(id: string) {
return prisma.tipoAtendimento.findUnique({ where: { id_tipo_atendimento: id } });
}
findByNome(nome: string) {
return prisma.tipoAtendimento.findFirst({ where: { nome_tipo_atendimento: nome } });
}
count(where: any) {
return prisma.tipoAtendimento.count({ where });
}
findMany(where: any, orderBy: any, skip: number, take: number) {
return prisma.tipoAtendimento.findMany({ where, orderBy, skip, take });
}
}