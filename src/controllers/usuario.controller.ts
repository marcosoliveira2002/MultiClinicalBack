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
  async me(req: Request, res: Response) {
    try {
      const userFromToken = (req as any).user as { sub: string; login: string };
      const me = await usuarioService.me(userFromToken.sub);

      if (!me) return res.status(404).json({ message: 'Usuário não encontrado' });

      return res.json({
        message: 'Usuário autenticado',
        usuario: { id: me.id_usuario, nome: me.nome_usuario, email: me.email }
      });
    } catch (err: any) {
      return res.status(500).json({ message: 'Erro interno' });
    }
  }
  listar = async (req: Request, res: Response) => {
    try {
      const usuarios = await usuarioService.listar();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const usuario = await usuarioService.obterPorId(req.params.id);
      return res.json(usuario);
    } catch (err: any) {
      return res.status(err.status || 500).json({
        message: err.message || 'Erro interno',
        details: err.issues
      });
    }
  };
  
  atualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await usuarioService.atualizar(id, req.body);
      return res.json(result);
    } catch (err: any) {
      return res.status(err.status || 500).json({
        message: err.message || 'Erro interno',
        details: err.issues
      });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const result = await usuarioService.forgotPassword(req.body);
      // Sempre 200, resposta genérica
      return res.json(result);
    } catch (err: any) {
      // Mesmo em erro de validação, pode retornar 200 genérico para não permitir enumeração
      if (err.status === 400) {
        return res.json({
          message: 'Se existir uma conta com esses dados, você receberá instruções no e-mail em instantes.'
        });
      }
      return res.status(500).json({ message: 'Erro interno' });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const result = await usuarioService.resetPassword(req.body);
      return res.json(result);
    } catch (err: any) {
      return res.status(err.status || 500).json({
        message: err.message || 'Erro interno',
        details: err.issues
      });
    }
  };
}


