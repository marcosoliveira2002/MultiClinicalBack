import { Request, Response, NextFunction } from 'express';
import { auth } from './auth';

type PublicRoute = { method: string; path: RegExp };

const publicRoutes: PublicRoute[] = [
  { method: 'POST', path: /^\/usuarios\/login$/ },
  { method: 'POST', path: /^\/usuarios$/ },       // cadastro
  { method: 'OPTIONS', path: /^\/.*$/ },          // preflight CORS
  { method: 'GET', path: /^\/health$/ },          // se tiver health
];

export function authUnless(req: Request, res: Response, next: NextFunction) {
  const isPublic = publicRoutes.some(
    r => r.method === req.method && r.path.test(req.path)
  );
  if (isPublic) return next();
  return auth(req, res, next);
}
