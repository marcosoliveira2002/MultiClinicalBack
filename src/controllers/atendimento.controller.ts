import { Request, Response } from 'express';
import { AtendimentoService } from '../services/atendimento.service';

const atendimentoService = new AtendimentoService();

export class AtendimentoController {
  criar = async (req: Request, res: Response) => {
    try {
      const atendimento = await atendimentoService.criar(req.body);
      return res.status(201).json(atendimento);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
