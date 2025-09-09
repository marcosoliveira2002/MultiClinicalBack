import { Request } from "express";

export type JwtUserPayload = {
  id_usuario: string;         // ajuste o nome aqui conforme seu token
  email?: string;
  // ...outros campos, se houver
};

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
}