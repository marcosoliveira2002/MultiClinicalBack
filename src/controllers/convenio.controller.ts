import { Request, Response } from 'express';
import { ConvenioService } from '../services/convenio.service';

const convenioService = new ConvenioService();

export class ConvenioController {
  criar = async (req: Request, res: Response) => {
    try {
      const convenio = await convenioService.criar(req.body);
      return res.status(201).json(convenio);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
