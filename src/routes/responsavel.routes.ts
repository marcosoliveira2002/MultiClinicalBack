import { Router } from 'express';
import { ResponsavelController } from '../controllers/responsavel.controller';
import { auth } from "../middlewares/auth";

const router = Router();
const controller = new ResponsavelController();

router.post('/', controller.criar);

router.delete("/:id", auth, ResponsavelController.delete);

export default router;
