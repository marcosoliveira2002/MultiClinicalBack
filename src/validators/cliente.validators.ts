import { z } from "zod";


function somenteDigitos(v: string) { return v.replace(/\D/g, ""); }



function validaCpf(cpf: string) {
const s = somenteDigitos(cpf);
if (s.length !== 11 || /^([0-9])\1{10}$/.test(s)) return false;
let soma = 0; for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i);
let d1 = 11 - (soma % 11); if (d1 >= 10) d1 = 0; if (d1 !== parseInt(s[9])) return false;
soma = 0; for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i);
let d2 = 11 - (soma % 11); if (d2 >= 10) d2 = 0; return d2 === parseInt(s[10]);
}


export const createClienteSchema = z.object({
nome_cliente: z.string({ required_error: "nome_cliente é obrigatório" }).min(3, "mínimo 3 caracteres"),
cpf: z
.string({ required_error: "cpf é obrigatório" })
.refine((v) => validaCpf(v), { message: "cpf inválido" }),
data_nascimento: z.coerce.date({ required_error: "data_nascimento é obrigatória" }),
telefone: z.string({ required_error: "telefone é obrigatório" }).min(8, "telefone inválido"),
status_atividade: z.boolean().optional().default(true),
});


export const updateClienteSchema = z.object({
nome_cliente: z.string().min(3).optional(),
cpf: z.string().refine((v) => validaCpf(v), { message: "cpf inválido" }).optional(),
data_nascimento: z.coerce.date().optional(),
telefone: z.string().min(8).optional(),
status_atividade: z.boolean().optional(),
});


export const listClienteQuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(10),
q: z.string().optional(),
status: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
orderBy: z.enum(["nome_cliente", "created_at", "updated_at", "data_nascimento"]).default("nome_cliente"),
order: z.enum(["asc", "desc"]).default("asc"),
});


export const idParamSchema = z.object({ id: z.string().uuid("id inválido") });


export type CreateClienteDTO = z.infer<typeof createClienteSchema>;
export type UpdateClienteDTO = z.infer<typeof updateClienteSchema>;
export type ListClienteQuery = z.infer<typeof listClienteQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;