import express from 'express';
import usuarioRoutes from './routes/usuario.routes';
import clienteRoutes from './routes/cliente.routes';
import responsavelRoutes from './routes/responsavel.routes';
import tipoAtendimentoRoutes from './routes/tipoAtendimento.routes';
import clinicaRoutes from './routes/clinica.routes';
import convenioRoutes from './routes/convenio.routes';
import procedimentoRoutes from './routes/procedimento.routes';
import atendimentoRoutes from './routes/atendimento.routes';
const app = express();

app.use(express.json());
app.use('/usuarios', usuarioRoutes);
app.use('/clientes', clienteRoutes);
app.use('/responsaveis', responsavelRoutes);
app.use('/tipos-atendimento', tipoAtendimentoRoutes);
app.use('/clinicas', clinicaRoutes);
app.use('/convenios', convenioRoutes);
app.use('/procedimentos', procedimentoRoutes);
app.use('/atendimentos', atendimentoRoutes);


export default app;

