import { z } from "zod";


/**
* CREATE — campos obrigatórios para cadastro de convênio
*/
export const createConvenioSchema = z.object({
nome_convenio: z.string({ required_error: "nome_convenio é obrigatório" }).min(3, "mínimo 3 caracteres"),
valor_coparticipacao: z.coerce.number({ required_error: "valor_coparticipacao é obrigatório" }).nonnegative("não pode ser negativo"),
telefone_convenio: z
.string({ required_error: "telefone_convenio é obrigatório" })
.min(8, "telefone inválido"),
nome_contato_convenio: z
.string({ required_error: "nome_contato_convenio é obrigatório" })
.min(3, "mínimo 3 caracteres"),
email_contato_convenio: z
.string({ required_error: "email_contato_convenio é obrigatório" })
.email("e-mail inválido"),
// Opcional. Se não vier, Prisma mantém default(true)
status_atividade: z.boolean().optional().default(true),
});


/**
* UPDATE — todos os campos opcionais
*/
export const updateConvenioSchema = z.object({
nome_convenio: z.string().min(3).optional(),
valor_coparticipacao: z.coerce.number().nonnegative().optional(),
telefone_convenio: z.string().min(8).optional(),
nome_contato_convenio: z.string().min(3).optional(),
email_contato_convenio: z.string().email().optional(),
status_atividade: z.boolean().optional(), // true=ativo, false=inativo
});


/**
* LIST — query params com paginação, busca e filtro de status
*/
export const listConvenioQuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(10),
q: z.string().optional(),
status: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
orderBy: z
.enum(["nome_convenio", "valor_coparticipacao", "created_at", "updated_at"])
.default("nome_convenio"),
order: z.enum(["asc", "desc"]).default("asc"),
});


/**
* PARAMS — útil para validação de rota com :id
*/
export const idParamSchema = z.object({
id: z.string().uuid("id inválido"),
});


export type CreateConvenioDTO = z.infer<typeof createConvenioSchema>;
export type UpdateConvenioDTO = z.infer<typeof updateConvenioSchema>;
export type ListConvenioQuery = z.infer<typeof listConvenioQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;