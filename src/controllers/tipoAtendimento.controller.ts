import { Request, Response } from 'express';
import { TipoAtendimentoService } from '../services/tipoAtendimento.service';

const tipoAtendimentoService = new TipoAtendimentoService();

export class TipoAtendimentoController {
  criar = async (req: Request, res: Response) => {
    try {
      const tipo = await tipoAtendimentoService.criar(req.body);
      return res.status(201).json(tipo);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
