import { ClienteRepository } from "../repositories/cliente.repository";
import type { CreateClienteDTO, UpdateClienteDTO, ListClienteQuery } from "../validators/cliente.validators";


const repo = new ClienteRepository();


function digits(v: string) { return v.replace(/\D/g, ""); }


export class ClienteService {
 async create(data: CreateClienteDTO) {
    const cpf = digits(data.cpf);
    const existe = await repo.findByCpf(cpf);
    if (existe) throw new Error("Já existe um cliente com esse CPF.");

    // monta payload base sem campos do responsável (pois não existem em Cliente)
    const { responsavel_nome, responsavel_telefone, ...clienteSemResp } = data;

    // se vierem os dois campos, cria nested Responsavel e vincula
    if (responsavel_nome && responsavel_telefone) {
      return repo.create({
        ...clienteSemResp,
        cpf,
        responsavel: {
          create: {
            nome_responsavel: responsavel_nome,
            telefone: responsavel_telefone,
          },
        },
      });
    }

    // sem responsável → cria só o cliente
    return repo.create({ ...clienteSemResp, cpf });
  }

  async update(id: string, data: UpdateClienteDTO) {
    const payload: any = { ...data };
    if (data.cpf) {
      const cpf = digits(data.cpf);
      const conflito = await repo.findByCpf(cpf);
      if (conflito && conflito.id_cliente !== id) throw new Error("CPF já utilizado por outro cliente.");
      payload.cpf = cpf;
    }
    return repo.update(id, payload);
  }


  async getById(id: string) {
    const item = await repo.findById(id);
    if (!item) throw new Error("Cliente não encontrado.");
    return item;
  }


  async list(params: ListClienteQuery) {
    const { page, limit, q, status, orderBy, order } = params;
    const skip = (page - 1) * limit;


    const where: any = {};
    if (q && q.trim()) {
      const qLike = { contains: q, mode: "insensitive" as const };
      where.OR = [
        { nome_cliente: qLike },
        { cpf: { contains: q.replace(/\D/g, "") } },
        { telefone: qLike },
      ];
    }
    if (status !== "TODOS") where.status_atividade = status === "ATIVO";


    const [total, items] = await Promise.all([
      repo.count(where),
      repo.findMany(where, { [orderBy]: order }, skip, limit),
    ]);


    return { page, limit, total, total_pages: Math.ceil(total / limit), items };
  }


  async inativar(id: string) { return repo.update(id, { status_atividade: false }); }
  async ativar(id: string) { return repo.update(id, { status_atividade: true }); }
}