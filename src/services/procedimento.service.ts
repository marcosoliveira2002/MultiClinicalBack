import { ProcedimentoRepository } from "../repositories/procedimento.repository";
import type { CreateProcedimentoDTO, UpdateProcedimentoDTO, ListProcedimentoQuery } from "../validators/procedimento.validators";


const repo = new ProcedimentoRepository();


export class ProcedimentoService {
async create(data: CreateProcedimentoDTO) {
const existe = await repo.findByNome(data.nome_procedimento);
if (existe) throw new Error("Já existe um procedimento com esse nome.");
return repo.create(data);
}


async update(id: string, data: UpdateProcedimentoDTO) {
if (data.nome_procedimento) {
const confl = await repo.findByNome(data.nome_procedimento);
if (confl && confl.id_procedimento !== id) throw new Error("Nome já utilizado por outro procedimento.");
}
return repo.update(id, data);
}


async getById(id: string) {
const item = await repo.findById(id);
if (!item) throw new Error("Procedimento não encontrado.");
return item;
}


async list(params: ListProcedimentoQuery) {
const { page, limit, q, status, orderBy, order } = params;
const skip = (page - 1) * limit;


const where: any = {};
if (q && q.trim()) where.OR = [{ nome_procedimento: { contains: q, mode: "insensitive" } }];
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