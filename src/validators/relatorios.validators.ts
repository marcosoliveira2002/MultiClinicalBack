import { z } from "zod";

export const listAtendimentosQuerySchema = z.object({
  inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "inicio no formato YYYY-MM-DD").optional(),
  fim:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "fim no formato YYYY-MM-DD").optional(),

  id_clinica: z.string().uuid().optional(),
  id_convenio: z.string().uuid().optional(),
  id_tipo_atendimento: z.string().uuid().optional(),
  id_procedimento: z.string().uuid().optional(),
  cpf_cliente: z.string().optional(), // envia sem máscara (ou eu limpo no service)

  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),

  order_by: z.enum([
    "data_atendimento",
    "valor_bruto",
    "valor_liquido" // OBS: valor_liquido ordena no app layer
  ]).default("data_atendimento"),
  order_dir: z.enum(["asc", "desc"]).default("desc"),
}).refine(v => {
  if (v.inicio && v.fim) return new Date(v.fim) >= new Date(v.inicio);
  return true;
}, { message: "fim deve ser maior ou igual a inicio", path: ["fim"] });

export type ListAtendimentosQueryDTO = z.infer<typeof listAtendimentosQuerySchema>;
