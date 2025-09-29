import { z } from "zod";

export const dashboardQuerySchema = z.object({
  inicio: z.string().datetime({ offset: false, message: "inicio deve ser ISO sem timezone, ex: 2025-09-01T00:00:00" })
            .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "inicio no formato YYYY-MM-DD")),
  fim:    z.string().datetime({ offset: false, message: "fim deve ser ISO sem timezone, ex: 2025-09-30T23:59:59" })
            .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "fim no formato YYYY-MM-DD")),
}).refine(v => new Date(v.fim) >= new Date(v.inicio), {
  message: "fim deve ser maior ou igual a inicio",
  path: ["fim"],
});
