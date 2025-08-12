import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string;   // id do usuário
      login: string;
      iat?: number;
      exp?: number;
    };
  }
}
