import { ConvenioRepository } from "../repositories/convenio.repository";
import type { CreateConvenioDTO, UpdateConvenioDTO, ListConvenioQuery } from "../validators/convenio.validators";


const repo = new ConvenioRepository();


export class ConvenioService {
async create(data: CreateConvenioDTO) {
const existente = await repo.findByEmail(data.email_contato_convenio);
if (existente) throw new Error("E-mail de contato já cadastrado para outro convênio.");
return repo.create(data);
}


async update(id: string, data: UpdateConvenioDTO) {
if (data.email_contato_convenio) {
const conflito = await repo.findByEmail(data.email_contato_convenio);
if (conflito && conflito.id_convenio !== id) throw new Error("E-mail já utilizado por outro convênio.");
}
return repo.update(id, data);
}


async getById(id: string) {
const conv = await repo.findById(id);
if (!conv) throw new Error("Convênio não encontrado.");
return conv;
}


async list(params: ListConvenioQuery) {
const { page, limit, q, status, orderBy, order } = params;
const skip = (page - 1) * limit;


const where: any = {};
if (q && q.trim()) {
where.OR = [
{ nome_convenio: { contains: q, mode: "insensitive" } },
{ nome_contato_convenio: { contains: q, mode: "insensitive" } },
{ email_contato_convenio: { contains: q, mode: "insensitive" } },
{ telefone_convenio: { contains: q, mode: "insensitive" } },
];
}
if (status !== "TODOS") {
where.status_atividade = status === "ATIVO";
}


const [total, items] = await Promise.all([
repo.count(where),
repo.findMany(where, { [orderBy]: order }, skip, limit),
]);


return { page, limit, total, total_pages: Math.ceil(total / limit), items };
}


async inativar(id: string) {
return repo.update(id, { status_atividade: false });
}


async ativar(id: string) {
return repo.update(id, { status_atividade: true });
}
}