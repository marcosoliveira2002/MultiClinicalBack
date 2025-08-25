import { ClinicaRepository } from "../repositories/clinica.repository";
import type { CreateClinicaDTO, UpdateClinicaDTO, ListClinicaQuery } from "../validators/clinica.validators";


const repo = new ClinicaRepository();


export class ClinicaService {
async create(data: CreateClinicaDTO) {
const existe = await repo.findByEmail(data.email_clinica);
if (existe) throw new Error("Já existe uma clínica com esse e-mail.");
return repo.create(data);
}


async update(id: string, data: UpdateClinicaDTO) {
if (data.email_clinica) {
const conflito = await repo.findByEmail(data.email_clinica);
if (conflito && conflito.id_clinica !== id) throw new Error("E-mail já utilizado por outra clínica.");
}
return repo.update(id, data);
}


async getById(id: string) {
const item = await repo.findById(id);
if (!item) throw new Error("Clínica não encontrada.");
return item;
}


async list(params: ListClinicaQuery) {
const { page, limit, q, status, orderBy, order } = params;
const skip = (page - 1) * limit;


const where: any = {};
if (q && q.trim()) {
where.OR = [
{ nome_clinica: { contains: q, mode: "insensitive" } },
{ nome_responsavel: { contains: q, mode: "insensitive" } },
{ email_clinica: { contains: q, mode: "insensitive" } },
{ telefone_clinica: { contains: q, mode: "insensitive" } },
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