import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { auth } from '../middlewares/auth';

const router = Router();
const controller = new UsuarioController();

router.post('/', controller.criar);
router.post('/login', controller.login);
 
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

router.get('/', auth, controller.listar);
router.get('/me', auth, controller.me.bind(controller));
router.get('/:id', auth, controller.buscarPorId); 
router.put('/:id', auth, controller.atualizar); 


export default router;
