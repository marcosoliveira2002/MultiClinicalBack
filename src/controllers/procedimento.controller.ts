import { Request, Response } from 'express';
import { ProcedimentoService } from '../services/procedimento.service';

const procedimentoService = new ProcedimentoService();

export class ProcedimentoController {
  criar = async (req: Request, res: Response) => {
    try {
      const procedimento = await procedimentoService.criar(req.body);
      return res.status(201).json(procedimento);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
