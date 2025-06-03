import { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service';

const clienteService = new ClienteService();

export class ClienteController {
  criar = async (req: Request, res: Response) => {
    try {
      const cliente = await clienteService.criar(req.body);
      return res.status(201).json(cliente);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
