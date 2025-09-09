import { AtendimentoRepository } from "../repositories/atendimento.repository";
import type { CreateAtendimentoDTO, UpdateAtendimentoDTO, ListAtendimentoQuery } from "../validators/atendimento.validators";
import { PrismaClient } from "@prisma/client";

const repo = new AtendimentoRepository();
const prisma = new PrismaClient();

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export class AtendimentoService {
  private async ensureActiveFKs(data: Partial<CreateAtendimentoDTO | UpdateAtendimentoDTO>) {
    const checks: Array<Promise<any>> = [];
    if (data.id_convenio) checks.push(prisma.convenio.findUnique({ where: { id_convenio: data.id_convenio }, select: { status_atividade: true } }));
    if (data.id_procedimento) checks.push(prisma.procedimento.findUnique({ where: { id_procedimento: data.id_procedimento }, select: { status_atividade: true } }));
    if (data.id_clinica) checks.push(prisma.clinica.findUnique({ where: { id_clinica: data.id_clinica }, select: { status_atividade: true } }));
    if (data.id_tipo_atendimento) checks.push(prisma.tipoAtendimento.findUnique({ where: { id_tipo_atendimento: data.id_tipo_atendimento }, select: { status_atividade: true } }));
    const results = await Promise.all(checks);
    for (const r of results) if (!r || r.status_atividade !== true) throw new Error("FK inativa ou inexistente.");
  }

  // ATENÇÃO: a CreateAtendimentoDTO mudou (agora tem cpf_cliente e nome_cliente)
  async create(data: CreateAtendimentoDTO, userId: string) {
    // 1) resolver cliente pelo CPF
    const cpf = onlyDigits(data.cpf_cliente);
    let cliente = await prisma.cliente.findUnique({ where: { cpf } });

    if (!cliente) {
      // Se SEU SCHEMA permitir nulos: criação rápida só com nome+cpf
      // Caso contrário, use placeholders (veja bloco abaixo)
      cliente = await prisma.cliente.create({
        data: {
          cpf,
          nome_cliente: data.nome_cliente ?? "Cliente",
          // Se campos forem opcionais, pode omitir. Se quiser, setar undefined explicitamente
          // data_nascimento: undefined,
          // telefone: undefined,
          status_atividade: true,
        },
      });
    }

    // 2) valida FKs
    await this.ensureActiveFKs(data);

    // 3) cria atendimento com o id_cliente resolvido
    return repo.create({
      id_cliente: cliente.id_cliente,
      id_convenio: data.id_convenio,
      id_procedimento: data.id_procedimento,
      id_clinica: data.id_clinica,
      id_tipo_atendimento: data.id_tipo_atendimento,
      id_usuario: userId,
      valor_bruto: data.valor_bruto,
      desconto: data.desconto ?? 0,
      observacao: data.observacao,
      data_atendimento: data.data_atendimento,
    });
  }

  async update(id: string, data: UpdateAtendimentoDTO) {
    await this.ensureActiveFKs(data);
    return repo.update(id, data); // não permitir troca de id_usuario aqui
  }

  async getById(id: string) {
    const item = await repo.findById(id);
    if (!item) throw new Error("Atendimento não encontrado.");
    return item;
  }

  async list(params: ListAtendimentoQuery) {
    const { page, limit, q, date_from, date_to, id_cliente, id_convenio, id_procedimento, id_clinica, id_tipo_atendimento, id_usuario, valor_min, valor_max, orderBy, order } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (id_cliente) where.id_cliente = id_cliente;
    if (id_convenio) where.id_convenio = id_convenio;
    if (id_procedimento) where.id_procedimento = id_procedimento;
    if (id_clinica) where.id_clinica = id_clinica;
    if (id_tipo_atendimento) where.id_tipo_atendimento = id_tipo_atendimento;
    if (id_usuario) where.id_usuario = id_usuario;

    if (date_from || date_to) where.data_atendimento = { gte: date_from ?? undefined, lte: date_to ?? undefined };

    const valorFilter: any = {};
    if (valor_min != null) valorFilter.gte = valor_min;
    if (valor_max != null) valorFilter.lte = valor_max;
    if (Object.keys(valorFilter).length) where.valor_bruto = valorFilter;

    if (q && q.trim()) {
      const qClean = q.trim();
      where.OR = [
        { cliente: { nome_cliente: { contains: qClean, mode: "insensitive" } } },
        { cliente: { cpf: { contains: qClean.replace(/\D/g, "") } } },
        { clinica: { nome_clinica: { contains: qClean, mode: "insensitive" } } },
        { convenio: { nome_convenio: { contains: qClean, mode: "insensitive" } } },
        { procedimento: { nome_procedimento: { contains: qClean, mode: "insensitive" } } },
        { tipoAtendimento: { nome_tipo_atendimento: { contains: qClean, mode: "insensitive" } } },
        { usuario: { nome_usuario: { contains: qClean, mode: "insensitive" } } },
        { observacao: { contains: qClean, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      repo.count(where),
      repo.findMany(where, { [orderBy]: order }, skip, limit),
    ]);

    const result = items.map((i) => ({ ...i, valor_liquido: i.valor_bruto - i.desconto }));

    return { page, limit, total, total_pages: Math.ceil(total / limit), items: result };
  }

  async remove(id: string) {
    return repo.delete(id);
  }
}
