import { Request, Response } from 'express';
import { ResponsavelService } from '../services/responsavel.service';

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
}
