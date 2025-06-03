import { Router } from 'express';
import { TipoAtendimentoController } from '../controllers/tipoAtendimento.controller';

const router = Router();
const controller = new TipoAtendimentoController();

router.post('/', controller.criar);

export default router;
