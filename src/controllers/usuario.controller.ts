import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';

const usuarioService = new UsuarioService();

export class UsuarioController {
  criar = async (req: Request, res: Response) => {
    try {
      const usuario = await usuarioService.criar(req.body);
      return res.status(201).json(usuario);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const resultado = await usuarioService.login(req.body);
      return res.status(200).json(resultado);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
