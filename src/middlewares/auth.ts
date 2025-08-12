import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/config/jwt';

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token ausente ou inválido' });
    }

    const payload = verifyToken(token);
    (req as any).user = payload; // simples e sem dor de cabeça com tipos

    return next();
  } catch {
    return res.status(401).json({ message: 'Não autorizado' });
  }
}
