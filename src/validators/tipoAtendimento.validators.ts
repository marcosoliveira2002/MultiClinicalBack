import { z } from "zod";


export const createTipoAtSchema = z.object({
nome_tipo_atendimento: z
.string({ required_error: "nome_tipo_atendimento é obrigatório" })
.min(3, "mínimo 3 caracteres"),
status_atividade: z.boolean().optional().default(true),
});


export const updateTipoAtSchema = z.object({
nome_tipo_atendimento: z.string().min(3).optional(),
status_atividade: z.boolean().optional(),
});


export const listTipoAtQuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(10),
q: z.string().optional(),
status: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
orderBy: z.enum(["nome_tipo_atendimento", "created_at", "updated_at"]).default("nome_tipo_atendimento"),
order: z.enum(["asc", "desc"]).default("asc"),
});


export const idParamSchema = z.object({ id: z.string().uuid("id inválido") });


export type CreateTipoAtDTO = z.infer<typeof createTipoAtSchema>;
export type UpdateTipoAtDTO = z.infer<typeof updateTipoAtSchema>;
export type ListTipoAtQuery = z.infer<typeof listTipoAtQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;