import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id_usuario?: string;
        email?: string;
        sub?: string;
        login?: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};