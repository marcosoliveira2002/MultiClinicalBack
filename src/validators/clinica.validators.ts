import { z } from "zod";


export const createClinicaSchema = z.object({
nome_clinica: z.string().min(3, "mínimo 3 caracteres"),
taxa_repasse_clinica: z.coerce.number().nonnegative(),
telefone_clinica: z.string().min(8, "telefone inválido"),
nome_responsavel: z.string().min(3, "mínimo 3 caracteres"),
email_clinica: z.string().email(),
status_atividade: z.boolean().optional().default(true),
});


export const updateClinicaSchema = z.object({
nome_clinica: z.string().min(3).optional(),
taxa_repasse_clinica: z.coerce.number().nonnegative().optional(),
telefone_clinica: z.string().min(8).optional(),
nome_responsavel: z.string().min(3).optional(),
email_clinica: z.string().email().optional(),
status_atividade: z.boolean().optional(),
});


export const listClinicaQuerySchema = z.object({
page: z.coerce.number().int().positive().default(1),
limit: z.coerce.number().int().positive().max(100).default(10),
q: z.string().optional(),
status: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
orderBy: z.enum(["nome_clinica", "created_at", "updated_at"]).default("nome_clinica"),
order: z.enum(["asc", "desc"]).default("asc"),
});


export const idParamSchema = z.object({ id: z.string().uuid("id inválido") });


export type CreateClinicaDTO = z.infer<typeof createClinicaSchema>;
export type UpdateClinicaDTO = z.infer<typeof updateClinicaSchema>;
export type ListClinicaQuery = z.infer<typeof listClinicaQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;