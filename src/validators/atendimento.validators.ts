import { z } from "zod";

const cpfLimpo = (v: string) => v.replace(/\D/g, "");

export const createAtendimentoSchema = z.object({
  // trocamos id_cliente por cpf_cliente e adicionamos nome_cliente opcional
  cpf_cliente: z
    .string({ required_error: "cpf_cliente é obrigatório" })
    .transform(cpfLimpo)
    .refine((s) => s.length === 11, "cpf_cliente deve conter 11 dígitos"),
  nome_cliente: z.string().min(2).optional(),

  id_convenio: z.string().uuid(),
  id_procedimento: z.string().uuid(),
  id_clinica: z.string().uuid(),
  id_tipo_atendimento: z.string().uuid(),

  valor_bruto: z.coerce.number().positive(),
  desconto: z.coerce.number().min(0).default(0),
  observacao: z.string().max(1000).optional(),
  data_atendimento: z.coerce.date(),
}).refine((v) => v.desconto <= v.valor_bruto, {
  message: "desconto não pode ser maior que o valor_bruto",
  path: ["desconto"],
});

export const updateAtendimentoSchema = z.object({
  id_cliente: z.string().uuid().optional(),
  id_convenio: z.string().uuid().optional(),
  id_procedimento: z.string().uuid().optional(),
  id_clinica: z.string().uuid().optional(),
  id_tipo_atendimento: z.string().uuid().optional(),
  valor_bruto: z.coerce.number().positive().optional(),
  desconto: z.coerce.number().min(0).optional(),
  observacao: z.string().max(1000).optional(),
  data_atendimento: z.coerce.date().optional(),
}).refine((v) => (v.valor_bruto == null || v.desconto == null) || (v.desconto! <= v.valor_bruto!), {
  message: "desconto não pode ser maior que o valor_bruto",
  path: ["desconto"],
});

export const listAtendimentoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  id_cliente: z.string().uuid().optional(),
  id_convenio: z.string().uuid().optional(),
  id_procedimento: z.string().uuid().optional(),
  id_clinica: z.string().uuid().optional(),
  id_tipo_atendimento: z.string().uuid().optional(),
  id_usuario: z.string().uuid().optional(),
  valor_min: z.coerce.number().min(0).optional(),
  valor_max: z.coerce.number().min(0).optional(),
  orderBy: z.enum(["data_atendimento", "valor_bruto", "desconto", "created_at", "updated_at"]).default("data_atendimento"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.object({ id: z.string().uuid("id inválido") });

export type CreateAtendimentoDTO = z.infer<typeof createAtendimentoSchema>;
export type UpdateAtendimentoDTO = z.infer<typeof updateAtendimentoSchema>;
export type ListAtendimentoQuery = z.infer<typeof listAtendimentoQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
