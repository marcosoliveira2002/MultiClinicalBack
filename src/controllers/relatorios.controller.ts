import { RelatorioAtendimentosService } from "@/services/relatorios.service";
import { listAtendimentosQuerySchema } from "@/validators/relatorios.validators";
import { Request, Response } from "express";

const service = new RelatorioAtendimentosService();

export class RelatorioAtendimentosController {
  static async list(req: Request, res: Response) {
    try {
      const query = listAtendimentosQuerySchema.parse(req.query);
      const result = await service.list(query);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
