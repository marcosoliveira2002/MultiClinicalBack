// app.ts
import express from 'express';
import cors from 'cors';

import usuarioRoutes from './routes/usuario.routes';
import clienteRoutes from './routes/cliente.routes';
import responsavelRoutes from './routes/responsavel.routes';
import tipoAtendimentoRoutes from './routes/tipoAtendimento.routes';
import clinicaRoutes from './routes/clinica.routes';
import convenioRoutes from './routes/convenio.routes';
import procedimentoRoutes from './routes/procedimento.routes';
import atendimentoRoutes from './routes/atendimento.routes';
import { authUnless } from './middlewares/authUnless';

const app = express();


const defaultAllowed = [
  'http://localhost:5173',
  'http://172.20.50.43',
  'http://172.20.50.43:5173',
];
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ||
  defaultAllowed;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors()); 

app.use(express.json());


app.use(authUnless);

// Rotas
app.use('/usuarios', usuarioRoutes);
app.use('/clientes', clienteRoutes);
app.use('/responsaveis', responsavelRoutes);
app.use('/tipos-atendimento', tipoAtendimentoRoutes);
app.use('/clinicas', clinicaRoutes);
app.use('/convenios', convenioRoutes);
app.use('/procedimentos', procedimentoRoutes);
app.use('/atendimentos', atendimentoRoutes);



export default app;
