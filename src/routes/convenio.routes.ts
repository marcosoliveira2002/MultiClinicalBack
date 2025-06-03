import { Router } from 'express';
import { ConvenioController } from '../controllers/convenio.controller';

const router = Router();
const controller = new ConvenioController();

router.post('/', controller.criar);

export default router;
