import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

const router = Router();
const controller = new UsuarioController();

router.post('/', controller.criar);
router.post('/login', controller.login); 

export default router;
