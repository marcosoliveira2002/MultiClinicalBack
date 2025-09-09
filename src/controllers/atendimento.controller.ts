import { Request, Response } from "express";
import { AtendimentoService } from "../services/atendimento.service";
import { createAtendimentoSchema, updateAtendimentoSchema, listAtendimentoQuerySchema, idParamSchema } from "../validators/atendimento.validators";

const service = new AtendimentoService();

export class AtendimentoController {
  static async create(req: Request, res: Response) {
    try {
      const data = createAtendimentoSchema.parse(req.body);
      const userId = req.user?.id_usuario || req.user?.sub || req.user?.login;
      if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

      const result = await service.create(data, String(userId));
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await service.update(id, updateAtendimentoSchema.parse(req.body));
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await service.getById(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const query = listAtendimentoQuerySchema.parse(req.query);
      const result = await service.list(query);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await service.remove(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
