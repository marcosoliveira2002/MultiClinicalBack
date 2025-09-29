import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class RelatorioAtendimentosRepository {
  async countWhere(where: any) {
    return prisma.atendimento.count({ where });
  }

  async listWhere(where: any, skip: number, take: number, orderByDB: any) {
    return prisma.atendimento.findMany({
      where,
      skip,
      take,
      orderBy: orderByDB, // somente campos do DB
      select: {
        id_atendimento: true,
        data_atendimento: true,
        valor_bruto: true,
        desconto: true,

        cliente: { select: { id_cliente: true, nome_cliente: true, cpf: true } },
        convenio: { select: { id_convenio: true, nome_convenio: true, valor_coparticipacao: true } },
        clinica: { select: { id_clinica: true, nome_clinica: true, taxa_repasse_clinica: true } },
        tipoAtendimento: { select: { id_tipo_atendimento: true, nome_tipo_atendimento: true } },
        procedimento: { select: { id_procedimento: true, nome_procedimento: true } },
      },
    });
  }
}
