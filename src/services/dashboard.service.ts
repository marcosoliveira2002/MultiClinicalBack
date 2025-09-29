import { DashboardRepository } from "@/repositories/dashboard.repository";
import { calcLiquido, num, round2 } from "@/utils/finance"; // <-- use helpers centralizados

const repo = new DashboardRepository();

// (opcional) pegue o modo via env aqui pra não depender de outro módulo
type CalcMode = "aditivo" | "sequencial";
const CALC_MODE: CalcMode = (process.env.CALC_MODE as CalcMode) ?? "aditivo";

type GroupItem = { id: string; nome: string; liquido: number; quantidade: number };

export class DashboardService {
  async getDashboard(inicio: Date, fim: Date) {
    const rows = await repo.listPeriodo(inicio, fim);

    let qtd = 0;
    let bruto = 0;
    let desconto = 0;
    let liquidoTotal = 0;

    const porConvenio = new Map<string, GroupItem>();
    const porClinica = new Map<string, GroupItem>();
    const porTipo = new Map<string, GroupItem>();
    const porProcedimento = new Map<string, GroupItem>();

    for (const r of rows) {
      qtd += 1;

      const vb = num(r.valor_bruto);
      const desc = num(r.desconto ?? 0);
      const base = Math.max(0, vb - desc);

      bruto += vb;
      desconto += desc;

      // taxas vêm do banco em 0..100
      const taxaClin = num(r.clinica?.taxa_repasse_clinica ?? 0);
      const taxaConv = num(r.convenio?.valor_coparticipacao ?? 0);

      const liquido = calcLiquido(base, taxaClin, taxaConv, CALC_MODE);
      liquidoTotal += liquido;

      // Convenio
      if (r.convenio) {
        const id = r.convenio.id_convenio;
        const nome = r.convenio.nome_convenio;
        const prev = porConvenio.get(id) ?? { id, nome, liquido: 0, quantidade: 0 };
        prev.liquido = round2(prev.liquido + liquido);
        prev.quantidade += 1;
        porConvenio.set(id, prev);
      }

      // Clínica
      if (r.clinica) {
        const id = r.clinica.id_clinica;
        const nome = r.clinica.nome_clinica;
        const prev = porClinica.get(id) ?? { id, nome, liquido: 0, quantidade: 0 };
        prev.liquido = round2(prev.liquido + liquido);
        prev.quantidade += 1;
        porClinica.set(id, prev);
      }

      // Tipo
      if (r.tipoAtendimento) {
        const id = r.tipoAtendimento.id_tipo_atendimento;
        const nome = r.tipoAtendimento.nome_tipo_atendimento;
        const prev = porTipo.get(id) ?? { id, nome, liquido: 0, quantidade: 0 };
        prev.liquido = round2(prev.liquido + liquido);
        prev.quantidade += 1;
        porTipo.set(id, prev);
      }

      // Procedimento
      if (r.procedimento) {
        const id = r.procedimento.id_procedimento;
        const nome = r.procedimento.nome_procedimento;
        const prev = porProcedimento.get(id) ?? { id, nome, liquido: 0, quantidade: 0 };
        prev.liquido = round2(prev.liquido + liquido);
        prev.quantidade += 1;
        porProcedimento.set(id, prev);
      }
    }

    const ticketMedio = qtd > 0 ? round2(liquidoTotal / qtd) : 0;

    return {
      periodo: { inicio, fim },
      total: {
        quantidade_atendimentos: qtd,
        faturamento_bruto: round2(bruto),
        desconto_total: round2(desconto),
        faturamento_liquido: round2(liquidoTotal),
        ticket_medio: ticketMedio,
      },
      por_convenio: Array.from(porConvenio.values()).sort((a, b) => b.liquido - a.liquido),
      por_clinica: Array.from(porClinica.values()).sort((a, b) => b.liquido - a.liquido),
      por_tipo_atendimento: Array.from(porTipo.values()).sort((a, b) => b.liquido - a.liquido),
      por_procedimento: Array.from(porProcedimento.values()).sort((a, b) => b.liquido - a.liquido),
    };
  }
}
