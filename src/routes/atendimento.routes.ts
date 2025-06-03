import { Router } from 'express';
import { AtendimentoController } from '../controllers/atendimento.controller';

const router = Router();
const controller = new AtendimentoController();

router.post('/', controller.criar);

export default router;
