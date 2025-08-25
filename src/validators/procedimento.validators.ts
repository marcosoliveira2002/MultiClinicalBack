import { z } from "zod";


export const createProcedimentoSchema = z.object({
nome_procedimento: z
.string({ required_error: "nome_procedimento é obrigatório" })
.min(3, "mínimo 3 caracteres"),
status_atividade: z.boolean().optional().default(true),
});


export const updateProcedimentoSchema = z.object({
nome_procedimento: z.string().min(3).optional(),
status_atividade: z.boolean().optional(),
});


export const listProcedimentoQuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(10),
q: z.string().optional(),
status: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
orderBy: z.enum(["nome_procedimento", "created_at", "updated_at"]).default("nome_procedimento"),
order: z.enum(["asc", "desc"]).default("asc"),
});


export const idParamSchema = z.object({ id: z.string().uuid("id inválido") });


export type CreateProcedimentoDTO = z.infer<typeof createProcedimentoSchema>;
export type UpdateProcedimentoDTO = z.infer<typeof updateProcedimentoSchema>;
export type ListProcedimentoQuery = z.infer<typeof listProcedimentoQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;