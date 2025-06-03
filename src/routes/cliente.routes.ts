import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';

const router = Router();
const controller = new ClienteController();

router.post('/', controller.criar);

export default router;
