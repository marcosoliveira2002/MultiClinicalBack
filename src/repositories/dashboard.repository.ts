import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class DashboardRepository {
  async listPeriodo(inicio: Date, fim: Date) {
    // Busca enxuta: somente campos utilizados no cálculo e agrupamentos
    return prisma.atendimento.findMany({
      where: {
        data_atendimento: { gte: inicio, lte: fim },
      },
      select: {
        valor_bruto: true,
        desconto: true,
        data_atendimento: true,
        convenio: {
          select: {
            id_convenio: true,
            nome_convenio: true,
            valor_coparticipacao: true,
          },
        },
        clinica: {
          select: {
            id_clinica: true,
            nome_clinica: true,
            taxa_repasse_clinica: true,
          },
        },
        tipoAtendimento: {
          select: {
            id_tipo_atendimento: true,
            nome_tipo_atendimento: true,
          },
        },
        procedimento: {
          select: {
            id_procedimento: true,
            nome_procedimento: true,
          },
        },
      },
      orderBy: { data_atendimento: "asc" },
    });
  }
}
