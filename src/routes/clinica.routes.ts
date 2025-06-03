import { Router } from 'express';
import { ClinicaController } from '../controllers/clinica.controller';

const router = Router();
const controller = new ClinicaController();

router.post('/', controller.criar);

export default router;
