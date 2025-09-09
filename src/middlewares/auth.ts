import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/config/jwt";

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token ausente ou inválido" });
    }

    const raw = verifyToken(token) as unknown as Record<string, any>;

    req.user = {
      id_usuario: raw.id_usuario ?? raw.sub ?? raw.id ?? raw.userId,
      email: raw.email ?? raw.login ?? raw.username,
      iat: raw.iat,
      exp: raw.exp,
      sub: raw.sub,
      login: raw.login,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Não autorizado" });
  }
}
