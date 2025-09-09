import { PrismaClient, Prisma } from "@prisma/client";


const prisma = new PrismaClient();


const includeAll = {
  cliente: { select: { id_cliente: true, nome_cliente: true, cpf: true } },
  convenio: { select: { id_convenio: true, nome_convenio: true, status_atividade: true } },
  procedimento: { select: { id_procedimento: true, nome_procedimento: true, status_atividade: true } },
  clinica: { select: { id_clinica: true, nome_clinica: true, status_atividade: true } },
  tipoAtendimento: { select: { id_tipo_atendimento: true, nome_tipo_atendimento: true, status_atividade: true } },
  // ⬇️ AQUI: use campos que existem no seu modelo Usuario
  usuario: { select: { id_usuario: true, nome_usuario: true, login: true, email: true } },
} as const;


export class AtendimentoRepository {
create(data: any) {
return prisma.atendimento.create({ data, include: includeAll });
}
update(id: string, data: any) {
return prisma.atendimento.update({ where: { id_atendimento: id }, data, include: includeAll });
}
delete(id: string) {
return prisma.atendimento.delete({ where: { id_atendimento: id } });
}
findById(id: string) {
return prisma.atendimento.findUnique({ where: { id_atendimento: id }, include: includeAll });
}
count(where: Prisma.AtendimentoWhereInput) {
return prisma.atendimento.count({ where });
}
findMany(where: Prisma.AtendimentoWhereInput, orderBy: any, skip: number, take: number) {
return prisma.atendimento.findMany({ where, orderBy, skip, take, include: includeAll });
}
}