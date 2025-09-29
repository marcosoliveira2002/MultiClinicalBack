import { RelatorioAtendimentosRepository } from "@/repositories/relatorios.repository";
import { ListAtendimentosQueryDTO } from "@/validators/relatorios.validators";
import { calcLiquido, num, round2, toPerc } from "@/utils/finance";
import { CALC_MODE } from "@/config/dashboard";

const repo = new RelatorioAtendimentosRepository();
const onlyDigits = (v?: string) => (v ? v.replace(/\D/g, "") : v);

export class RelatorioAtendimentosService {
  async list(query: ListAtendimentosQueryDTO) {
    const {
      inicio, fim,
      id_clinica, id_convenio, id_tipo_atendimento, id_procedimento, cpf_cliente,
      page, per_page, order_by, order_dir
    } = query;

    const where: any = {};
    if (inicio || fim) {
      where.data_atendimento = {};
      if (inicio) where.data_atendimento.gte = new Date(`${inicio}T00:00:00`);
      if (fim)    where.data_atendimento.lte = new Date(`${fim}T23:59:59`);
    }
    if (id_clinica) where.id_clinica = id_clinica;
    if (id_convenio) where.id_convenio = id_convenio;
    if (id_tipo_atendimento) where.id_tipo_atendimento = id_tipo_atendimento;
    if (id_procedimento) where.id_procedimento = id_procedimento;
    if (cpf_cliente) where.cliente = { cpf: onlyDigits(cpf_cliente) };

    // Ordenação no DB (apenas campos reais da tabela)
    const orderByDB =
      order_by === "data_atendimento" || order_by === "valor_bruto"
        ? { [order_by]: order_dir }
        : { data_atendimento: "desc" };

    const total_items = await repo.countWhere(where);
    const total_pages = Math.max(1, Math.ceil(total_items / per_page));
    const pageSafe = Math.min(page, total_pages);
    const skip = (pageSafe - 1) * per_page;
    const take = per_page;

    const rows = await repo.listWhere(where, skip, take, orderByDB);

    // Monta items + calcula líquido e taxas por atendimento
    const items = rows.map(r => {
      const vb = num(r.valor_bruto);
      const desc = num(r.desconto ?? 0);
      const base = Math.max(0, vb - desc);

      const pClinPercent = num(r.clinica?.taxa_repasse_clinica ?? 0);   // 0..100 no banco
      const pConvPercent = num(r.convenio?.valor_coparticipacao ?? 0);  // 0..100 no banco

      const valor_liquido = calcLiquido(base, pClinPercent, pConvPercent, CALC_MODE);

      // valores das taxas coerentes com o modo
      const pClin = toPerc(pClinPercent);
      const pConv = toPerc(pConvPercent);

      let valor_taxa_clinica = 0;
      let valor_taxa_convenio = 0;

      if (CALC_MODE === "sequencial") {
        valor_taxa_clinica = round2(base * pClin);
        valor_taxa_convenio = round2((base - valor_taxa_clinica) * pConv);

        // Ajuste de centavos para casar com base - líquido
        const totalFees = round2(base - valor_liquido);
        const ajuste = round2(totalFees - round2(valor_taxa_clinica + valor_taxa_convenio));
        if (ajuste !== 0) valor_taxa_convenio = round2(valor_taxa_convenio + ajuste);
      } else {
        // aditivo: distribui proporcionalmente o total de taxas
        const totalFees = round2(base - valor_liquido);
        const pesos = pClin + pConv;

        if (pesos > 0) {
          valor_taxa_clinica = round2(totalFees * (pClin / pesos));
          valor_taxa_convenio = round2(totalFees - valor_taxa_clinica);
        }
      }

      return {
        id_atendimento: r.id_atendimento,
        data_atendimento: r.data_atendimento,
        cliente: r.cliente ? {
          id_cliente: r.cliente.id_cliente,
          nome_cliente: r.cliente.nome_cliente,
          cpf: r.cliente.cpf
        } : null,
        convenio: r.convenio ? {
          id_convenio: r.convenio.id_convenio,
          nome_convenio: r.convenio.nome_convenio
        } : null,
        clinica: r.clinica ? {
          id_clinica: r.clinica.id_clinica,
          nome_clinica: r.clinica.nome_clinica
        } : null,
        tipo_atendimento: r.tipoAtendimento ? {
          id_tipo_atendimento: r.tipoAtendimento.id_tipo_atendimento,
          nome_tipo_atendimento: r.tipoAtendimento.nome_tipo_atendimento
        } : null,
        procedimento: r.procedimento ? {
          id_procedimento: r.procedimento.id_procedimento,
          nome_procedimento: r.procedimento.nome_procedimento
        } : null,

        valor_bruto: round2(vb),
        desconto: round2(desc),
        valor_taxa_clinica: round2(valor_taxa_clinica),
        valor_taxa_convenio: round2(valor_taxa_convenio),
        valor_liquido
      };
    });

    // Ordenação por valor_liquido no app layer (quando solicitado)
    if (order_by === "valor_liquido") {
      items.sort((a, b) =>
        order_dir === "asc" ? a.valor_liquido - b.valor_liquido : b.valor_liquido - a.valor_liquido
      );
    }

    // ⬇️⬇️⬇️ AQUI estava faltando o return
    return {
      periodo: { inicio: inicio ?? null, fim: fim ?? null },
      pagination: {
        page: pageSafe,
        per_page,
        total_items,
        total_pages
      },
      items
    };
  }
}
