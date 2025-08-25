import { TipoAtendimentoRepository } from "../repositories/tipoAtendimento.repository";
import type { CreateTipoAtDTO, UpdateTipoAtDTO, ListTipoAtQuery } from "../validators/tipoAtendimento.validators";


const repo = new TipoAtendimentoRepository();


export class TipoAtendimentoService {
async create(data: CreateTipoAtDTO) {
const existe = await repo.findByNome(data.nome_tipo_atendimento);
if (existe) throw new Error("Já existe um tipo de atendimento com esse nome.");
return repo.create(data);
}


async update(id: string, data: UpdateTipoAtDTO) {
if (data.nome_tipo_atendimento) {
const confl = await repo.findByNome(data.nome_tipo_atendimento);
if (confl && confl.id_tipo_atendimento !== id) throw new Error("Nome já utilizado por outro tipo de atendimento.");
}
return repo.update(id, data);
}


async getById(id: string) {
const item = await repo.findById(id);
if (!item) throw new Error("Tipo de atendimento não encontrado.");
return item;
}


async list(params: ListTipoAtQuery) {
const { page, limit, q, status, orderBy, order } = params;
const skip = (page - 1) * limit;


const where: any = {};
if (q && q.trim()) where.OR = [{ nome_tipo_atendimento: { contains: q, mode: "insensitive" } }];
if (status !== "TODOS") where.status_atividade = status === "ATIVO"; // true/false


const [total, items] = await Promise.all([
repo.count(where),
repo.findMany(where, { [orderBy]: order }, skip, limit),
]);


return { page, limit, total, total_pages: Math.ceil(total / limit), items };
}


async inativar(id: string) { return repo.update(id, { status_atividade: false }); }
async ativar(id: string) { return repo.update(id, { status_atividade: true }); }
}