import { Router } from 'express';
import { ResponsavelController } from '../controllers/responsavel.controller';

const router = Router();
const controller = new ResponsavelController();

router.post('/', controller.criar);

export default router;
