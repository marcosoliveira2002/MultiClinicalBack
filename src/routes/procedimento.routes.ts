import { Router } from 'express';
import { ProcedimentoController } from '../controllers/procedimento.controller';

const router = Router();
const controller = new ProcedimentoController();

router.post('/', controller.criar);

export default router;
