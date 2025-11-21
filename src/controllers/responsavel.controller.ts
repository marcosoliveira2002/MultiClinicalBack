import { Request, Response } from 'express';
import { ResponsavelService } from '../services/responsavel.service';
import { idParamSchema } from "../validators/cliente.validators";
const responsavelService = new ResponsavelService();

export class ResponsavelController {
  criar = async (req: Request, res: Response) => {
    try {
      const responsavel = await responsavelService.criar(req.body);
      return res.status(201).json(responsavel);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
  static async delete(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await responsavelService.delete(id);
      return res.json(result); // ou res.status(204).send()
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

}
