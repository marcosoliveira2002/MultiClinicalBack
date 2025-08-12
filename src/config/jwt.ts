// src/config/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d';

export type AppJwtPayload = {
  sub: string;  // id do usuário
  login: string;
};

// Assina um JWT. Tipamos o mínimo pra não depender dos tipos da lib.
export function signToken(payload: AppJwtPayload) {
  return jwt.sign(
    payload as any,
    SECRET,
    { expiresIn: EXPIRES_IN, algorithm: 'HS256' } as any
  );
}

// Verifica e retorna seu payload (com iat/exp opcionais)
export function verifyToken(token: string): AppJwtPayload & { iat?: number; exp?: number } {
  return jwt.verify(token, SECRET) as any;
}
